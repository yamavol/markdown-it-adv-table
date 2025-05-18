
export class Lexer {
  static readonly EOF = -1;
  static readonly EMPTY = "";
  static readonly WHITESPACE = /\s/;
  static readonly ALPHANUM = /[a-zA-Z0-9]/;
  input: string;
  pos: number;

  constructor(input: string) {
    this.input = input;
    this.pos = 0;
  }

  /** Return current char */
  get char() {
    return this.input[this.pos] || Lexer.EMPTY;
  }

  /** Return remaining string */
  get str() {
    return this.input.slice(this.pos);
  }

  /** Return current charcode */
  peek(): number  {
    return this.input.codePointAt(this.pos) || Lexer.EOF;
  }

  /** Return next charcode */
  peekNext(): number {
    return this.input.codePointAt(this.pos + 1) || Lexer.EOF;;
  }

  /** test against upcoming string  */
  match(ptn: string): boolean {
    return this.str.startsWith(ptn);
  }

  /** Return current charcode and advance cursor by one */
  next(): number {
    const char = this.peek();
    this.pos++;
    return char;
  }

  /** Return true if cursor is at the end of input */
  eof(): boolean {
    return this.pos >= this.input.length;
  }

  /** Peek letters and skip input */
  skip(re: RegExp) {
    while (re.test(this.char)) {
      this.pos++;
    }
  }

  /** Skip whitespaces */
  skipWhitespace() {
    this.skip(Lexer.WHITESPACE);
  }

  /** Consume single letter */
  consume(): string {
    const result = this.char;
    this.pos++;
    return result;
  }

  /** Consume a sequence of letters  */
  consumeRe(re: RegExp): string {
    const match = re.exec(this.str);
    if (!match) {
      return Lexer.EMPTY;
    }
    const word = match[0];
    this.pos += word.length;
    return word;
  }

  /** Consume word (/^[a-zA-Z_][a-zA-Z0-9_]+/) */
  consumeWord(): string {
    return this.consumeRe(/^[a-zA-Z_][a-zA-Z0-9_]+/);
  }

  /** Consume quote enclosed literal  */
  consumeLiteral(quote: string): string {
    const q = quote.codePointAt(0);
    const escape = "\\".codePointAt(0);
    if (this.peek() !== q) {
      return Lexer.EMPTY;
    }
    this.pos++;
    let result = [q];
    
    let cp = 0;
    while (cp !== q) {
      cp = this.peek();
      if (cp === q) {
        result.push(this.next());
        break;
      }
      else if (cp === escape) {
        result.push(this.next());
        const nextcp = this.peekNext();
        if (nextcp !== q && nextcp !== Lexer.EOF) {
          result.push(this.next());
        }
      }
      else if (cp === Lexer.EOF) {
        // unenclosed quote
        break;
      }
      else {
        result.push(this.next());
      }
    }

    return String.fromCodePoint(...result);
  }

  /** Return codepoint of a letter, or EOF if input string is empty */
  static cp(ch: string): number {
    return ch.codePointAt(0) || Lexer.EOF;
  }

  /** Return true if the codepoint matches the string */
  static cmp(cp: number, ch: string): boolean {
    return cp === ch.codePointAt(0);
  }

  /** Return true if the codepoint matches our EOF number */
  static isEOF(cp: number): boolean {
    return cp === Lexer.EOF;
  }

  /** Return true if the codepint is likely to be whitespace */
  static isWhitespace(cp: number): boolean {
    // return this.WHITESPACE.test(String.fromCodePoint(cp));
    return cp === " ".codePointAt(0)! || cp === "\t".codePointAt(0)!;
  }

  static isAlphabet(cp: number): boolean {
    // return cp >= "a".codePointAt(0)! && cp <= "z".codePointAt(0)! ||
    //        cp >= "A".codePointAt(0)! && cp <= "Z".codePointAt(0)!;
    return (cp >= 97 && cp <= 122) || (cp >= 65 && cp <= 90);
  }

  static isNumber(cp: number): boolean {
    // return cp >= "0".codePointAt(0)! && cp <= "9".codePointAt(0)!;
    return cp >= 48 && cp <= 57;
  }

  static isAlnum(cp: number): boolean {
    return this.isAlphabet(cp) || this.isNumber(cp);
  }
}



export function unwrapLiteral(str: string, quote: string): string {
  if (str.startsWith(quote)) {
    str = str.slice(1);
  }
  if (str.endsWith(quote)) {
    str = str.slice(0, -1);
  }
  return str;
}

export function unwrapEnclosed(str: string, open: string, close: string): string {
  if (str.startsWith(open)) {
    str = str.slice(open.length);
  }
  if (str.endsWith(close)) {
    str = str.slice(0, -close.length);
  }
  return str;
}