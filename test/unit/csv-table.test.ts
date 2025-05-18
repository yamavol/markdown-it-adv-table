import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";
import { CsvTableParser } from "../../src/csv-table";
import { csvTable } from "../../src/index";
import { trimIndent as t } from "./test-utils.test";

describe("csv-table test", () => {

  describe ("csv parse", () => {
    it ("basic parse", () => {
      const csv = CsvTableParser.parsecsv("1,2,3\n4,5,6\n");
      expect(csv.length).toBe(2);
      expect(csv[0].length).toBe(3);
      expect(csv[1].length).toBe(3);
      expect(csv[0][0]).toBe("1");
      expect(csv[1][2]).toBe("6");
    });
    it ("single value table", () => {
      const csv = CsvTableParser.parsecsv("1");
      expect(csv.length).toBe(1);
      expect(csv[0].length).toBe(1);
      expect(csv[0][0]).toBe("1");
    });
  });

  it ("basic conversion", () => {
    const input = t(`
      \`\`\`csv-table
      1,2,3
      4,5,6
      7,8,9
      \`\`\`
      `);
    const md = new MarkdownIt().use(csvTable);
    const html = md.render(input, {});
    expect(html.slice(0, 7)).toBe("<table>");
    expect(html.slice(html.length - 9)).toBe("</table>\n");
  });

  it ("single cell table?", () => {
    const input = t(`
      \`\`\`csv-table
      12345
      \`\`\`
      `);
    const md = new MarkdownIt().use(csvTable);
    const html = md.render(input, {});
    expect(html).toBe("<table>\n<tr>\n<td>12345</td>\n</tr>\n</table>\n");
  });
});