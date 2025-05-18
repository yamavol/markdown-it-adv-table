import { describe } from "node:test";
import { expect, it, test } from "vitest";
import { Lexer } from "../../src/lexer";

describe("lexer tests", () => {

  it("check basic patterns", () => {
    const lexer = new Lexer("abc");
    expect(lexer.char).toBe("a");
    expect(lexer.str).toBe("abc");
    expect(lexer.peek()).toBe("a".codePointAt(0));
    expect(lexer.peekNext()).toBe("b".codePointAt(0));
    expect(lexer.next()).toBe("a".codePointAt(0));
    expect(lexer.char).toBe("b");
    expect(lexer.str).toBe("bc");
    expect(lexer.peek()).toBe("b".codePointAt(0));
    expect(lexer.peekNext()).toBe("c".codePointAt(0));
  });

  it("check complex queries", () => {
    const lexer = new Lexer("abc def ghi=jkl mno=\"pqr\" stu=\"vw \\\"xyz\"");
    expect(lexer.consumeWord()).toBe("abc");
    expect(lexer.peek()).toBe(" ".codePointAt(0));
    lexer.skipWhitespace();
    expect(lexer.peek()).toBe("d".codePointAt(0));
    expect(lexer.consumeWord()).toBe("def");
    lexer.skipWhitespace();
    expect(lexer.consumeWord()).toBe("ghi");
    expect(lexer.next()).toBe("=".codePointAt(0));
    expect(lexer.consumeWord()).toBe("jkl");
    lexer.skipWhitespace();
    expect(lexer.consumeWord()).toBe("mno");
    expect(lexer.next()).toBe("=".codePointAt(0));
    expect(lexer.peek()).toBe("\"".codePointAt(0));
    expect(lexer.consumeLiteral("\"")).toBe("\"pqr\"");
    lexer.skipWhitespace();
    expect(lexer.consumeWord()).toBe("stu");
    expect(lexer.next()).toBe("=".codePointAt(0));
    expect(lexer.consumeLiteral("\"")).toBe("\"vw \\\"xyz\"");
  });

  it ("invalid syntaxes", () => {
    let lexer = new Lexer("abc");
    let prev = lexer.pos;
    expect(lexer.consumeLiteral("\"")).toBe("");
    expect(lexer.pos).toBe(prev);

    lexer = new Lexer("\"abc");
    prev = lexer.pos;
    expect(lexer.consumeLiteral("\"")).toBe("\"abc");
    expect(lexer.peek()).toBe(Lexer.EOF);
    
    lexer = new Lexer("\"abc\\");
    prev = lexer.pos;
    expect(lexer.consumeLiteral("\"")).toBe("\"abc\\");
    expect(lexer.peek()).toBe(Lexer.EOF);
  });
});