import type { StateBlock } from "markdown-it/index.js";
import { debug } from "./debug.js";
import { CellAttr, CellState, TableSpec } from "./table.js";

export type TokenAppendor = (state: StateBlock) => void;

interface ITableBuilder {
  startTable(): void;
  endTable(): void;
  insertCell(fn: TokenAppendor, attr?: CellAttr): void;
}

/**
 * Constructs a table token stream
 */
export class TableBuilder implements ITableBuilder {

  readonly state: StateBlock;
  readonly tableSpec: TableSpec;
  readonly _cells: CellState;

  constructor(state: StateBlock, tableSpec: TableSpec) {
    this.state = state;
    this.tableSpec = tableSpec;
    this._cells = new CellState(tableSpec);
  }
  private get useColgroup() {
    return this.tableSpec.attr.cols?.startsWith("\"");
  }
  private get useTHead() {
    return this.tableSpec.headerRows > 0;
  }
  private get useTBody() {
    return this.useTHead;
  }
  startTable() {
    const token = this.state.push("table_open", "table", 1);
    this.tableSpec.classes.forEach(name => {
      token.attrJoin("class", name);
    });

    if (this.tableSpec.attr["caption"] !== undefined) {
      this.setCaption(this.tableSpec.attr["caption"]);
    }
    if (this.useColgroup) {
      this.setColgroup(this.tableSpec.numCols);
    }
  }

  endTable(): void {
    if (this.useTBody) {
      this.endTBody();
    }
    this.state.push("table_close", "table", -1);
  }

  insertCell(fn: TokenAppendor, attr?: CellAttr)  {
    const { row, col } = this._cells.next();
    debug("cell", row, col);

    if (attr !== undefined) {
      this._cells.set(row, col, attr);
    }

    const isRowFirst = this._cells.isRowFirst(row, col);
    const isRowLast = this._cells.isRowLast(row, col);
    
    const cell = this._cells.get(row, col);
    const tx = 
      (cell && cell.attr.header === true)
      || row < this.tableSpec.headerRows
      || col < this.tableSpec.headerCols ? "th" : "td";

    if (isRowFirst) {
      if (this.useTHead && row === 0) {
        this.startTHead();
      } else if (this.useTBody && row === this.tableSpec.headerRows){
        this.startTBody();
      }
      this.startRow();
    }

    const token = this.state.push(`${tx}_open`, tx, 1);
    if (cell && cell.attr.rowspan !== undefined) {
      token.attrSet("rowspan", cell.rowspan.toString());
    }
    if (cell && cell.attr.colspan !== undefined) {
      token.attrSet("colspan", cell.colspan.toString());
    }
    if (cell && cell.attr.align !== undefined) {
      token.attrSet("style", `text-align: ${cell.attr.align}`);
    }

    fn(this.state);
    
    this.state.push(`${tx}_close`, tx, -1);

    if (isRowLast) {
      this.endRow();

      if (this.useTHead && row == this.tableSpec.headerRows - 1) {
        this.endTHead();
      }
    }
  }

  private setCaption(caption: string) {
    this.state.push("caption_open", "caption", 1);
    const token = this.state.push("inline", "", 0);
    token.content = caption;
    token.children = [];
    this.state.push("caption_close", "caption", -1);
  }

  private setColgroup(numCols: number) {
    this.state.push("colgroup_open", "colgroup", 1);
    for (let c = 0; c < numCols; c++) {
      const widthProp = this.tableSpec.colspecs.colWidthPropValue(c);
      const token = this.state.push("col", "col", 0);
      token.attrSet("style", `width: ${widthProp}`);
    }
    this.state.push("colgroup_close", "colgroup", -1);
  }

  private startTHead() {
    this.state.push("thead_open", "thead", 1);
  } 
  private endTHead() {
    this.state.push("thead_close", "thead", -1);
  }
  private startTBody() {
    this.state.push("tbody_open", "tbody", 1);
  }
  private endTBody() {
    this.state.push("tbody_close", "tbody", -1);
  }
  private startRow() {
    this.state.push("tr_open", "tr", 1);
  }
  private endRow() {
    this.state.push("tr_close", "tr", -1);
  }
}