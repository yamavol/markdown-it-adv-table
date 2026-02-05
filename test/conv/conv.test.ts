import MarkdownIt from "markdown-it";
import { expect, test } from "vitest";
import advTable from "../../src/index";
import { trimIndent as t } from "../unit/test-utils.test.ts";



test("conv test", () => {
  const md = new MarkdownIt();
  md.use(advTable, {});
  let html = md.render("# Hello World!");
  expect(html).toBe("<h1>Hello World!</h1>\n");

  html = md.render(t(`
    \`\`\`table cols="1,1,1" header-rows=1
    | Header 1
    | Header 2
    | Header 3
    | Cell 1
    | Cell 2
    | Cell 3
    \`\`\``));
  expect(html).toBe(t(`
    <table>
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

