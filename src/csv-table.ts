import { StateBlock } from "markdown-it/index.js";
import { Lexer, unwrapLiteral } from "./lexer.js";
import { TableBuilder } from "./table-builder.js";
import { TableSpec } from "./table.js";


export class CsvTableParser {

  private _tableSpec: TableSpec;
  readonly delim: string;

  constructor(tableSpec: TableSpec, delimitor: string = ",", ) {
    this._tableSpec = tableSpec;
    this.delim = delimitor;
  }

  static new(params: string, delim: string): CsvTableParser {
    const attr = TableSpec.parseInfoString(params);
    const tablespec = new TableSpec(attr);
    return new CsvTableParser(tablespec, delim);
  }

  parse(state: StateBlock, startLine: number, endLine: number) {
    const lines = state.getLines(startLine, endLine, state.blkIndent, false);
    const cells = CsvTableParser.parsecsv(lines, this.delim);
    if (this._tableSpec.attr.cols === undefined) {
      const numCols = CsvTableParser.numCols(cells);
      this._tableSpec.colspecs.lazyInit(numCols);
    }

    const builder = new TableBuilder(state, this._tableSpec);
    const md = state.md;
    const istate = new md.inline.State("", md, state.env, []);

    builder.startTable();
    for (let row = 0; row < cells.length; row++) {
      for (let col = 0; col < cells[row].length; col++) {
        
        const itoken = istate.push("text", "", 0);
        itoken.content = cells[row][col];
        
        // manually assign inline token to disable being inline-processed.
        builder.insertCell(state => {
          const token = state.push("inline", "", 0);
          token.content = ""; 
          token.children = [itoken];
        });
      }
    }
    builder.endTable();
  }

  static numCols(cells: string[][]): number {
    let colMax = 1;
    for (let row = 0; row < cells.length; row++) {
      colMax = Math.max(colMax, cells[row].length);
    }
    return colMax;
  }

  static parsecsv(text: String, delim: string = ","): string[][] {
    const lines = text.split("\n");
    let result = [] as string[][];
    for (const line of lines) {
      // skip empty line
      if (line.trim().length === 0) {
        continue;
      }
      const lexer = new Lexer(line);
      const columns = [] as string[];
      let cp = 0;
      while (cp != Lexer.EOF) {
        lexer.skipWhitespace();
        cp = lexer.peek();
        
        if (Lexer.cmp(cp, "\"")) {
          let literal = lexer.consumeLiteral("\"");
          literal = unwrapLiteral(literal, "\"");
          columns.push(literal);
        }
        else if (Lexer.cmp(cp, delim)) {
          lexer.skipWhitespace();
          // if next letter is "," insert empty column
          if (Lexer.cmp(lexer.peekNext(), delim)) {
            columns.push("");
          }
          lexer.next();
        }
        else if (!Lexer.isEOF(cp)) {
          columns.push(lexer.consumeRe(/^[^,]+/));
        }
        else {
          break;
        }
      }
      result.push(columns);
    }

    return result;
  }
}
