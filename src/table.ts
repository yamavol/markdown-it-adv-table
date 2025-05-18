
import { Lexer, unwrapLiteral } from "./lexer.js";

type HAlign = "left" | "center" | "right";

type TableAttrKeys = "cols"
  | "style" 
  | "header-rows" 
  | "header-cols"
  | "format";

export type TableAttr = 
  { [key in TableAttrKeys]?: string } & { [key: string]: string };

export interface ColumnAttr {
  align?: HAlign;
  width?: string; 
}

export type CellAttr = {
  align?: HAlign;
  colspan?: number;
  rowspan?: number;
  header?: boolean;
};

/**
 * TableSpec keeps table attributes
 */
export class TableSpec {

  readonly attr: TableAttr;
  readonly styles: string[];
  readonly headerRows: number;
  readonly headerCols: number;
  readonly colspecs: ColSpecs;

  constructor(attr: TableAttr) {
    this.attr = attr;
    this.headerRows = parseInt(attr["header-rows"] ?? "0");
    this.headerCols = parseInt(attr["header-cols"] ?? "0");
    this.colspecs = new ColSpecs(attr.cols ?? "");
    this.styles = TableSpec.parseStyle(attr.style ?? "");
  }

  get numCols(): number {
    return this.colspecs.numCols;
  }

  static parseStyle(style: string): string[] {
    return style.split(",").map((s) => s.trim());
  }

  static parseInfoString(info: string): TableAttr {
    const lexer = new Lexer(info);
    const tokens: string[] = [];
    const wordRe = /^[a-zA-Z][a-zA-Z0-9_\-]+/;
    const result = {} as TableAttr;
    let cp = 0;
    while (cp != Lexer.EOF) {
      lexer.skipWhitespace();
      cp = lexer.peek();
      if (Lexer.isAlphabet(cp)) {
        tokens.push(lexer.consumeRe(wordRe));
      }
      else if (Lexer.cmp(cp, "\"")) {
        tokens.push(lexer.consumeLiteral("\""));
      }
      else if (Lexer.cmp(cp, "=")) {
        tokens.push(lexer.consume());
      }
      else if (Lexer.isEOF(cp)) {
        break;
      }
      else {
        // unknown symbol?
        tokens.push(lexer.consume());
      }
    };

    const pairedKeys = TableSpec.awareKeys() as string[];

    let lc = 0;
    while (tokens[lc] !== undefined) {
      const token = tokens[lc];

      if (pairedKeys.includes(token)) {
        const key = consume();
        consume("=");
        const value = consume();
        result[key] = value;
      }
      else {
        // ignore unknown token
        consume();
      }
    }

    return result;

    /** consume one token from token stream */
    function consume(text?: string): string {
      const token = tokens[lc];
      if (text && token !== text) {
        throw new Error(`parse error: expected ${text} but found ${token}`);
      }
      lc++;
      return token;
    }
  }

  static awareKeys(): TableAttrKeys[] {
    const k: Required<TableAttr> = {
      cols: "",
      align: "",
      "header-cols": "",
      "header-rows": "",
      style: "",
      format: ""
    };
    return Object.keys(k) as TableAttrKeys[];
  }
}

/**
 * ColSpecs keeps all column specifications
 */
export class ColSpecs {
  readonly numCols: number;
  readonly specs: readonly ColumnAttr[];

  constructor(colspec: string) {
    if (colspec.startsWith("\"") || colspec.includes(",")) {
      // colspec must be "1,1,1" not 1,1,1
      // we can try parse 1,1,1 .... but since this is an invalid syntax, 
      // the parser won't recognize unwrapped commma-separated values.
      const specs = unwrapLiteral(colspec, "\"").split(",");
      this.numCols = Math.max(1, specs.length);
      this.specs = specs.map(ColSpecs.parseColSpec);
    }
    else if (/^\d+/.test(colspec)) {
      this.numCols = Math.max(1, parseInt(colspec, 10));
      this.specs = Array(this.numCols).fill({});
    }
    else {
      this.numCols = 0;
      this.specs = Array(this.numCols).fill({});
    }
  }

  colSpec(col: number): ColumnAttr {
    return this.specs[col] || {};
  }

  colWidth(col: number): number {
    const spec = this.colSpec(col);
    if (spec.width) {
      return parseInt(spec.width, 10);
    }
    return 1;
  }

  colWidthRatio(col: number): number {
    let totalWidth = 0;
    for (let c = 0; c < this.numCols; c++) {
      totalWidth += this.colWidth(c);
    }
    return this.colWidth(col) / totalWidth;
  }

  /** Forcefully re-initailize this instance. */
  lazyInit(cols: number): void {
    (this as any).numCols = cols;
    (this as any).specs = Array(cols).fill({});
  }

  /** Parse colspec for single column */
  static parseColSpec(spec: string): ColumnAttr {
    let pos = 0;
    const attr = {} as ColumnAttr;
    while (pos < spec.length) {
      const char = spec[pos];
      if (char === "^") {
        consume();
        attr.align = "center";
      } 
      else if (char === "<") {
        consume();
        attr.align = "left";
      }
      else if (char === ">") {
        consume();
        attr.align = "right";
      }
      else if (char >= "0" && char <= "9") {
        attr.width = consumeNumber();
        break;
      } 
      else {
        consume();
      }
    }

    return attr;

    function consume(): string {
      return spec[pos++];
    }
    function consumeNumber(): string {
      const match = spec.slice(pos).match(/^\d+/);
      if (!match) throw new Error("cannot consume number");
      return match[0];
    }
  }
}

export class TableCell {
  row: number;
  col: number;
  attr: CellAttr;
  constructor(row: number, col: number, attr: CellAttr) {
    this.row = row;
    this.col = col;
    this.attr = attr;
  }

  get colspan(): number {
    return this.attr.colspan || 1;
  }
  
  get rowspan(): number {
    return this.attr.rowspan || 1;
  }

  is(row: number, col: number): boolean {
    return this.row === row && this.col === col;
  }

  isIn(row: number, col: number, rspan: number, cspan: number): boolean {
    return (
      this.row <= row && this.row + this.rowspan > row && 
      this.col <= col && this.col + this.colspan > col
    );
  }

  contains(row: number, col: number): boolean {
    return (
      this.row <= row && this.row + this.rowspan > row && 
      this.col <= col && this.col + this.colspan > col
    );
  }
}


/**
 * A state machine to track cell position and its attributes
 */
export class CellState {
  private static readonly _initialPos = [-1, -1] as readonly [number, number];
  private readonly _tableSpec: TableSpec;
  private _pos: [number, number];
  private _cells: TableCell[];

  constructor(tableSpec: TableSpec) {
    this._tableSpec = tableSpec;
    this._pos = [...CellState._initialPos];
    this._cells = [];
  }

  get numCols(): number {
    return this._tableSpec.numCols;
  }

  get pos(): [number, number] {
    return this._pos;
  }

  get row(): number {
    return this._pos[0];
  }

  set row(num: number) {
    this._pos[0] = num;
  }

  get col(): number {
    return this._pos[1];
  }

  set col(num: number) {
    this._pos[1] = num;
  }

  /** Starting from the top-left cell, find the next free cell. **/
  next(): { row: number; col: number } {
    if (this.row === -1) {
      this.row = 0;
      this.col = 0;
    }
    else {
      do  {
        this.col++;
        if (this.col >= this.numCols) {
          this.col = 0;
          this.row++;
        }
      } while (this.isSpanned(this.row, this.col));
    }
  
    return {
      row: this.row,
      col: this.col,
    };
  }

  /**
   * Get cell attribute. If the cell is spanned by the other, it will return
   * the belonging cell. Returns undefined if no attribute is set.
   */
  get(row: number, col: number): TableCell | undefined {
    for (const span of this._cells) {
      if (span.contains(row, col)) {
        return span;
      }
    }
    return undefined;
  }

  /**
   * Set cell attribute. If the cell is already spanned by the other,
   * it will update the belonging cell. Modifying the span size will
   * wipe attributes from the cells being affected. 
   */
  set(row: number, col: number, attr: CellAttr) {
    for (const span of this._cells) {
      if (span.contains(row, col)) {
        Object.assign(span.attr, attr);
        this.wipe(span.row, span.col, span.rowspan, span.colspan, true);
        return;
      }
    }
    this._cells.push(new TableCell(row, col, attr));
  }

  wipe(row: number, col: number, rowspan: number, colspan: number, keepOrigin: boolean = false) {
    this._cells = this._cells.filter(c => {
      return keepOrigin
        ? c.isIn(row, col, rowspan, colspan) && !c.is(row, col) 
        : c.isIn(row, col, rowspan, colspan);
    });
  }

  /** Return true if this cell is spanned (includes self spanning) */
  isSpanned(row: number, col: number): boolean {
    for (const span of this._cells) {
      if (!span.is(row, col) && span.contains(row, col)) {
        return true;
      }
    }
    return false;
  }

  /** Return the cell which covers the given cell (excludes self span)*/
  spannedBy(row: number, col: number): TableCell | undefined {
    for (const span of this._cells) {
      if (!span.is(row, col) && span.contains(row, col)) {
        return span;
      }
    }
    return undefined;
  }

  /** Return true if this cell is the left most cell **/
  isLeftMost(row: number, col: number): boolean {
    if (col <= 0) {
      return true; // left most, or out of range
    }
    else {
      const span = this.get(row, col);
      return span !== undefined && span.col === 0;
    }
  }

  isRightMost(row: number, col: number): boolean {
    if (col >= this.numCols - 1) {
      return true; // right most, or out of range
    }
    else {
      const span = this.get(row, col);
      return span !== undefined && (span.col + span.colspan) === this.numCols;
    }
  }

  isRowFirst(row: number, col: number): boolean {
    if (col < 0)
      return false;
    if (col === 0) {
      // If this cell is spanned by the other cell, it is not a row starter
      return this.spannedBy(row, col) === undefined;
    }

    // if this cell is spanned by the other cell, 
    // always return false. 
    if (this.spannedBy(row, col) !== undefined) {
      return false;
    }

    while (col > 0) {
      const span = this.spannedBy(row, col - 1);

      // recursively check left cell
      if (span !== undefined) {
        if (span.col < col) {
          if (span.row === row) {
            return false;     // spanning cell is in the same row
          } 
          else {
            col = span.col;
          }
        }
        else {
          throw new Error("never happen. check implementation");
        }
      }
      else {
        return false;
      }
    }
    // all cells in left are spanned, so this cell is the row-first cell
    return true;
  }

  isRowLast(row: number, col: number): boolean {
    if (col >= this.numCols)
      return false;
    if (col === this.numCols - 1) {
      // If this cell is spanned by the other cell, it is not a row closer.
      return this.spannedBy(row, col) === undefined;
    }

    // if this cell is spanned by the other cell, 
    // always return false. 
    if (this.spannedBy(row, col) !== undefined) {
      return false;
    }

    while (col < this.numCols - 1) {
      const span = this.spannedBy(row, col + 1);

      // recursively check right cell
      if (span !== undefined) {
        if (span.col + span.colspan > col) {
          col = span.col + span.colspan;
        } 
        else {
          throw new Error("never happen. check implementation");
        }
      } 
      else {
        return false;
      }
    }
    // all cells in right are spanned, so this cell is the row-last cell
    return true;
  }
}

