
import type { StateBlock, Token } from "markdown-it/index.js";
import { CellState } from "./cell.js";
import { debug } from "./debug.js"; 

class FlatTableParser {
  private _src: string;
  private _args: { [key: string]: string };
  private _cell: CellState;

  constructor(src: string, info: string) {
    this._src = src;
    this._cell = new CellState(0);
    this._args = {};
  }

  /**
   * Parse custom table syntax into tokens.
   * 
   * @param state markdown-it parser state
   * @param startLine the first line which contains the table syntax. 
   * @param endLine the last line which contains the table syntax.
   */
  parse(state: StateBlock, startLine: number, endLine: number) {
    debug("blkIndent", state.blkIndent);

    let opened = false;;
    let currentLine = startLine;
    
    while (currentLine < endLine) {
      const line = state.getLines(currentLine, currentLine + 1, state.blkIndent, false);

      // skip empty line
      if (line.trim().length === 0) {
        currentLine++;
        continue;
      }
      
      // table start/end marker
      if (line.startsWith("|==")) {
        if (!opened) {
          opened = true;
          let token = state.push("table_open", "table", 1);
          token.markup = "|==";
          token.map = [currentLine, currentLine + 1];

          token = state.push("tbody_open", "tbody", 1);
          
          this._cell.init(4);
          
          currentLine++;
          continue;
        }
        else {
          let token = state.push("tbody_close", "tbody", 1);

          token = state.push("table_close", "table", -1);
          token.markup = "|==";
          token.map = [currentLine, currentLine + 1];
          return;
        }
      }
      
      // cell starter
      if (this.isCellStart(state, currentLine)) {

        // find cell range
        const cellStart = currentLine;
        const cellIndent = this.getCellIndent(state, line);
        const cellAssign = this._cell.next();

        while (!this.isCellStart(state, currentLine + 1)) {
          currentLine++;
        }
        const cellEnd = currentLine;
        
        // parse cell content as document
        const cellContent = state.getLines(cellStart, cellEnd + 1, cellIndent, false).slice(2);
        debug("cell", cellAssign.col, cellAssign.row);
        
        const md = state.md;
        const cstate = new md.block.State(cellContent, md, {}, []);
        md.block.tokenize(cstate, 0, cellEnd + 1 - cellStart);

        // append token streams

        if (cellAssign.col === 0) {
          const token = state.push("tr_open", "tr", 1);
          token.markup = "";
          token.map = [cellStart, cellEnd + 1];
        }

        let token = state.push("td_open", "td", 1);
        token.markup = "";

        if (cstate.tokens.length === 3
            && cstate.tokens[0].type.startsWith("paragraph_open")
            && cstate.tokens[1].type.startsWith("inline")
            && cstate.tokens[2].type.startsWith("paragraph_close")
        ) {
          cstate.tokens = [cstate.tokens[1]];
        }

        state.tokens.push(...cstate.tokens);

        token = state.push("td_close", "td", -1);
        token.markup = "";

        if (cellAssign.col === this._cell.numCols - 1) {
          token = state.push("tr_close", "tr", -1);
          token.markup = "";
        }
        
        currentLine++;
      } 
      else {
        console.error("error: unparsed line", line, line.length);
        currentLine++;
      }
    }
  }

  isCellStart(state: StateBlock, lineNumber: number) {
    const line = state.getLines(lineNumber, lineNumber + 1, state.blkIndent, false);
    if (line.startsWith("|=="))
      return true;
    if (line.startsWith("|"))
      return true;
    if (line.match(/^(r\d+|c\d+)+\|/))
      return true;
    if (line.match(/^r\d+c\d+\|/))
      return true;
    if (line.match(/^c\d+\|/))
      return true;
    
    return false;
  }

  getCellIndent(state: StateBlock, line: string): number {
    // TODO: WIP
    return 2;
  }
}


export function flatTableParser(info: string, state: StateBlock, startLine: number, endLine: number) {
  debug("info: " + info);
  debug("range:", startLine, endLine);
  debug("indent level:", state.sCount[startLine]);
  
  const start = state.bMarks[startLine];
  const max = state.eMarks[endLine];
  const content = state.src.slice(start, max);
  debug("content:\n");

  const parser = new FlatTableParser(content, info);
  parser.parse(state, startLine + 1, endLine);
}