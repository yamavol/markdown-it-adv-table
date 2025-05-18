
import type { StateBlock } from "markdown-it/index.js";
import { CsvTableParser } from "./csv-table.js";
import { FlatTableParser } from "./flat-table.js";
import { TableAttr, TableSpec } from "./table.js";

/**
 * AdvTableParser delegates parsing to the appropriate parser 
 * based on the format option specified.
 */
export class AdvTableParser {

  readonly attrs: TableAttr;
  readonly params: string;
  
  constructor(param: string) {
    this.params = param;
    this.attrs = TableSpec.parseInfoString(this.params);
  }

  parse(state: StateBlock, startLine: number, endLine: number) {
    if (this.attrs.format === "csv") {
      const parser = CsvTableParser.new(this.params, ",");
      parser.parse(state, startLine, endLine);
    } 
    else if (this.attrs.format === "tsv") {
      const parser = CsvTableParser.new(this.params, "\t");
      parser.parse(state, startLine, endLine);
    }
    else {
      const parser = FlatTableParser.new(this.params, state, startLine, endLine);
      parser.parse(state, startLine, endLine);
    }
  }
}


