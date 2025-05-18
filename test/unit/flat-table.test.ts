import MarkdownIt from "markdown-it";
import { describe, expect, it, test } from "vitest";
import { FlatTableParser } from "../../src/flat-table";
import { flatTable } from "../../src/index";
import { trimIndent as t } from "./test-utils.test";

describe("flat-table test", () => {

  it ("basic conversion", () => {
    const input = t(`
      \`\`\`flat-table
      | col 1
      | col 2
      | col 3

      | cell 1
      | cell 2
      | cell 3

      | cell 4
      | cell 5
      | cell 6
      \`\`\`
      `);
    const md = new MarkdownIt().use(flatTable);
    const html = md.render(input, {});
    expect(html.slice(0, 7)).toBe("<table>");
    expect(html.slice(html.length - 9)).toBe("</table>\n");
  });

  it ("conversion (valid syntax, edge cases)", () => {
    const input = t(`
      \`\`\`flat-table
      
      |===
      | col 1
      | col 2
      | col 3

      | cell 1
      | cell 2
      | cell 3

      | cell 4
      | cell 5
      | cell 6
      |===
      \`\`\`
      `);

    const md = new MarkdownIt().use(flatTable);
    const html = md.render(input, {});
    expect(html.slice(0, 7)).toBe("<table>");
    expect(html.slice(html.length - 9)).toBe("</table>\n");
  });

  it ("invalid syntax", () => {
    const input = t(`
      \`\`\`flat-table
      12345
      \`\`\`
      `);

    expect(() => {
      new MarkdownIt().use(flatTable).render(input);
    }).toThrowError();
  });

  it ("empty table", () => {
    const input = t(`
      \`\`\`flat-table
      \`\`\`
      `);

    const md = new MarkdownIt().use(flatTable);
    const html = md.render(input, {});
    expect(html.slice(0, 7)).toBe("<table>");
    expect(html.slice(html.length - 9)).toBe("</table>\n");
  });

  it ("empty table (style2)", () => {
    const input = t("```flat-table\n```");
    const md = new MarkdownIt().use(flatTable);
    const html = md.render(input, {});
    expect(html.slice(0, 7)).toBe("<table>");
    expect(html.slice(html.length - 9)).toBe("</table>\n");
  });

  it ("empty  (endLine omitted)", () => {
    const input = t("```flat-table");
    const md = new MarkdownIt().use(flatTable);
    const html = md.render(input, {});
    expect(html.slice(0, 7)).toBe("<table>");
    expect(html.slice(html.length - 9)).toBe("</table>\n");
  });


  






});

test("parser unit tests", () => {
  const md = new MarkdownIt();
  const state = new md.block.State("abcde", md, {}, []);
  expect(FlatTableParser.getCellIndent(state, "| 12345")).toBe(2);
});