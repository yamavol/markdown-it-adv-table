import type { StateBlock } from "markdown-it/index.js";
import type { RuleBlock } from "markdown-it/lib/parser_block.mjs";

export type Parser = (info: string, state: StateBlock, startLine: number, endLine: number) => void;

/**
 * Parse fenced code block and if the name matches, the content is passed to 
 * the custom parser.
 */
export function fence_custom(names: string|string[], parser: Parser): RuleBlock {

  if (typeof names === "string") {
    names = [names];
  }
  
  return (state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean => {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
  
    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
  
    if (pos + 3 > max) { return false; }
  
    const marker = state.src.charCodeAt(pos);
    
    if (marker !== 0x7E/* ~ */ && marker !== 0x60 /* ` */) {
      return false;
    }
  
    // scan marker length
    let mem = pos;
    pos = state.skipChars(pos, marker);
    let len = pos - mem;
  
    if (len < 3) { return false; }
  
    const markup = state.src.slice(mem, pos);
    const params = state.src.slice(pos, max);
  
    if (marker === 0x60 /* ` */) {
      if (params.indexOf(String.fromCharCode(marker)) >= 0) {
        return false;
      }
    }

    if (!names.some(name => params.startsWith(name))) {
      return false;
    }
  
    // Since start is found, we can report success here in validation mode
    if (silent) { return true; }
  
    // search end of block
    let nextLine = startLine;
    let haveEndMarker = false;
  
    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }
  
      pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
  
      if (pos < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break;
      }
  
      if (state.src.charCodeAt(pos) !== marker) { continue; }
  
      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        // closing fence should be indented less than 4 spaces
        continue;
      }
  
      pos = state.skipChars(pos, marker);
  
      // closing code fence must be at least as long as the opening one
      if (pos - mem < len) { continue; }
  
      // make sure tail has spaces only
      pos = state.skipSpaces(pos);
  
      if (pos < max) { continue; }
  
      haveEndMarker = true;
      // found!
      break;
    }

    len = state.sCount[startLine];
    state.line = nextLine + (haveEndMarker ? 1 : 0);

    if (parser !== undefined) {
      parser(params, state, startLine, nextLine);
    }
    else {
      const token   = state.push("fence", "code", 0);
      token.info    = params;
      token.content = state.getLines(startLine + 1, nextLine, len, true);
      token.markup  = markup;
      token.map     = [startLine, state.line];
    }
    return true;
  };
}
