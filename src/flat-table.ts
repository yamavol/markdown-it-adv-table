import type { StateBlock } from "markdown-it/index.js";
import { TableBuilder } from "./table-builder.js";
import { CellAttr, TableSpec } from "./table.js";

/**
 * FlatTableParser parses the flat-table syntax. 
 */
export class FlatTableParser {
  private _tableSpec: TableSpec;

  constructor(tableSpec: TableSpec) {
    this._tableSpec = tableSpec;
  }

  static new(params: string, state: StateBlock, startLine: number, endLine: number): FlatTableParser {
    const attr = TableSpec.parseInfoString(params);
    if (attr.cols === undefined) {
      attr.cols = FlatTableParser.inferColCount(state, startLine, endLine).toString();
    }
    const tableSpec = new TableSpec(attr);
    return new FlatTableParser(tableSpec);
  }

  /**
   * Parse custom table syntax into tokens.
   * 
   * @param state markdown-it parser state
   * @param startLine the first line which contains the table syntax. 
   * @param endLine the last line which contains the table syntax.
   */
  parse(state: StateBlock, startLine: number, endLine: number) {
    const md = state.md;
    const builder = TableBuilder.newLocal(state, this._tableSpec);
    builder.startTable();

    let currentLine = startLine;
    while (currentLine < endLine) {
      const line = state.getLines(currentLine, currentLine + 1, state.blkIndent, false);

      // skip empty line
      if (line.trim().length === 0) {
        currentLine++;
        continue;
      }
      
      // cell starter
      if (FlatTableParser.isCellStart(line)) {

        // find cell content range
        const cellStart = currentLine;

        while (currentLine + 1 < endLine && !FlatTableParser.isCellStart(this.getline(state, currentLine + 1))) {
          currentLine++;
        }
        const cellEnd = currentLine;
        
        // parse cell content as document
        const cellIndent = FlatTableParser.getCellIndent(state, line);
        const cellSpec = FlatTableParser.cellspec(line);
        const cellAttr = FlatTableParser.parseCellspec(cellSpec);

        const cellContent = state.getLines(cellStart, cellEnd + 1, cellIndent, false).slice(cellSpec.length + cellIndent);
        const cstate = new md.block.State(cellContent, md, state.env, []);
        md.block.tokenize(cstate, 0, cellEnd + 1 - cellStart);
        
        if (cstate.tokens.length === 3
          && cstate.tokens[0].type.startsWith("paragraph_open")
          && cstate.tokens[1].type.startsWith("inline")
          && cstate.tokens[2].type.startsWith("paragraph_close")
        ) {
          cstate.tokens[0].hidden = true;
          cstate.tokens[2].hidden = true;
        }
        
        builder.insertCell(state => {
          state.tokens.push(...cstate.tokens);
        }, cellAttr);

        currentLine++;
      } 
      else {
        const shortline = line.length > 10 ? line.slice(0,10) + "..." : line;
        throw new Error(`parse error: invalid syntax: ${shortline}`);
      }
    }

    builder.endTable();

    state.tokens.push(...builder.state.tokens);
  }

  getline(state: StateBlock, lineNumber: number): string {
    return state.getLines(lineNumber, lineNumber + 1, state.blkIndent, false);
  }
  
  static getCellIndent(state: StateBlock, line: string): number {
    const cellStart = line.search(/\|/);
    const numSpaces = line.slice(cellStart + 1).search(/\S|$/); // number of spaces between symbol and text
    const userIndent = Math.max(0, Math.min(1 + numSpaces, 4));
    return state.blkIndent + userIndent;
  }
  
  static isCellStart(line: string) {
    if (line.startsWith("|"))
      return true;
    if (FlatTableParser.cellspec(line).length > 0)
      return true;
      
    return false;
  }

  /** extract cellspec from line */
  static cellspec(line: string): string {
    const match = /^((r\d+|c\d+|\<|\^|\>|h)*)\|/.exec(line);
    if (match === null) {
      return "";
    } else {
      return match[1];
    }
  }

  static parseCellspec(line: string): CellAttr {
    let pos = 0;
    const attr = {} as CellAttr;
    while (pos < line.length) {
      const char = line[pos];
      if (char === undefined) {
        break;
      }
      else if (char === "^") {
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
      else if (char === "r") {
        consume();
        attr.rowspan = parseInt(consumeNumber());
      }
      else if (char === "c") {
        consume();
        attr.colspan = parseInt(consumeNumber());
      }
      else if (char === "h") {
        consume();
        attr.header = true;
      }
      else {
        consume();
      }
    }
    return attr;

    function consume(): string {
      return line[pos++];
    }
    function consumeNumber(): string {
      const match = line.slice(pos).match(/^\d+/);
      if (!match) throw new Error("cannot consume number");
      pos += match[0].length;
      return match[0];
    }
  }


  static inferColCount(state: StateBlock, lineStart: number, lineEnd: number): number {
    // TBD: does not handle colspan, rowspan
    let contLen = 0;
    let contLenMax = 0;
    for (let line = lineStart; line < lineEnd; line++) {
      const linetext = state.getLines(line, line + 1, state.blkIndent, false);
      if (FlatTableParser.isCellStart(linetext)) {
        contLen++;
        contLenMax = Math.max(contLenMax, contLen);
      }
      else {
        contLen = 0;
      }
    }
    return contLenMax;
  }
}
