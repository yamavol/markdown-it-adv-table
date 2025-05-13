
type HAlign = "left" | "center" | "right";

interface ColumnAttr {
  align?: HAlign;
  width?: string; 
}

interface CellAttr {
  assigned: boolean;
  align?: HAlign;
  colspan?: number;
  rowspan?: number;
  header?: boolean;
  footer?: boolean;
}



/**
 * A state machine to track cell position and its attributes
 */
export class CellState {
  private static readonly _initialPos = [-1, -1] as readonly [number, number];
  private _pos: [number, number];
  private _cols: ColumnAttr[];
  private _cells: { [key: string]: CellAttr };

  constructor(columns: number) {
    this._pos = [...CellState._initialPos];
    this._cols = Array(Math.max(columns, 1)).fill({});
    this._cells = {};
  }

  get numCols(): number {
    return this._cols.length;
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

  init(numCols: number) {
    this._numCols = numCols;
    this._pos = [...CellState._initialPos];
    this._cols = Array(this._numCols).fill({});
    this._cells = {};
  }

  setColWidth(col: number, width?: string) {
    this._cols[col].width = width;
  }

  setColAlign(col: number, align?: HAlign) {
    this._cols[col].align = align;
  }

  setColSpan(row: number, col: number, cspan: number) {
    const key = mapKey(row, col);
    this._cells[key].colspan = cspan;

    for (let c = col; c < col + cspan; c++) {
      const key = mapKey(row, c);
      const cell = this._cells[key];
      cell.assigned = true;
    }
  }

  setRowSpan(row: number, col: number, rspan: number) {
    const key = mapKey(row, col);
    this._cells[key].rowspan = rspan;

    for (let r = row; r < row + rspan; r++) {
      const key = mapKey(r, col);
      const cell = this._cells[key];
      cell.assigned = true;
    }
  }

  /**
   * Return the next available cell
   */
  next(): { row: number; col: number } {
    if (this.row === -1) {
      this.row = 0;
      this.col = 0;
    }
    else {
      // skip reserved cells for cspan/rspan, and return next valid cell. WIP
      while (this.isUsed(this.row, this.col)) {
        this.col++;
        if (this.col >= this.numCols) {
          this.col = 0;
          this.row++;
        }
      }
    }

    this.markUsed(this.row, this.col);

    return {
      row: this.row,
      col: this.col,
    };
  }

  isUsed(row: number, col: number): boolean {
    const key = mapKey(row, col);
    return this._cells[key]?.assigned === true;
  }

  private markUsed(row: number, col: number): void {
    const key = mapKey(row, col);
    const map = this._cells[key];
    if (map === undefined) {
      this._cells[key] = { assigned: true };
    } else {
      map.assigned = true;
    }
  }
}


function mapKey(row: number, column: number): string {
  return `${row}-${column}`;
}