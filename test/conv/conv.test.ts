import MarkdownIt from "markdown-it";
import { describe, expect, it, test } from "vitest";
import advTable from "../../src/index";
import { trimIndent as t } from "../unit/test-utils.test.ts";



describe("conv test", () => {
  const md = new MarkdownIt();
  md.use(advTable, {});

  it("convert text", () => {
    const html = md.render("# Hello World!");
    expect(html).toBe("<h1>Hello World!</h1>\n");
  });

  it("convert flat-table", () => {
    const html = md.render(t(`
      \`\`\`table cols="1,1,1" header-rows=1 width=100%
      | Header 1
      | Header 2
      | Header 3
      | Cell 1
      | Cell 2
      | Cell 3
      \`\`\``));
    expect(html).toBe(t(`
      <table style="width: 100%">
      <colgroup>
      <col style="width: calc(100% * 1 / 3)">
      <col style="width: calc(100% * 1 / 3)">
      <col style="width: calc(100% * 1 / 3)">
      </colgroup>
      <thead>
      <tr>
      <th>Header 1</th>
      <th>Header 2</th>
      <th>Header 3</th>
      </tr>
      </thead>
      <tbody>
      <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
      <td>Cell 3</td>
      </tr>
      </tbody>
      </table>
      `));
  });

  it("convert table with 10 cols", () => {
    const html = md.render(t(`
      \`\`\`table cols=10 header-rows=1
      | cell0
      | cell1
      | cell2
      | cell3
      | cell4
      | cell5
      | cell6
      | cell7
      | cell8
      | cell9
      \`\`\`
      `));
    expect(html).toBe(t(`
      <table>
      <thead>
      <tr>
      <th>cell0</th>
      <th>cell1</th>
      <th>cell2</th>
      <th>cell3</th>
      <th>cell4</th>
      <th>cell5</th>
      <th>cell6</th>
      <th>cell7</th>
      <th>cell8</th>
      <th>cell9</th>
      </tr>
      </thead>
      <tbody></tbody>
      </table>
      `));
  });

  it("convert table with alignment directive", () => {
    const html = md.render(t(`
      \`\`\`table cols="<1,^1,>1" header-rows=1
      | Header1
      | Header2
      | Header3
      | Cell1
      | Cell2
      | Cell3
      \`\`\`
      `));
    expect(html).toBe(t(`
      <table>
      <colgroup>
      <col style="width: calc(100% * 1 / 3)">
      <col style="width: calc(100% * 1 / 3)">
      <col style="width: calc(100% * 1 / 3)">
      </colgroup>
      <thead>
      <tr>
      <th style="text-align: left">Header1</th>
      <th style="text-align: center">Header2</th>
      <th style="text-align: right">Header3</th>
      </tr>
      </thead>
      <tbody>
      <tr>
      <td style="text-align: left">Cell1</td>
      <td style="text-align: center">Cell2</td>
      <td style="text-align: right">Cell3</td>
      </tr>
      </tbody>
      </table>
      `));
  });
});

