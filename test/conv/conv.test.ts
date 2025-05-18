import MarkdownIt from "markdown-it";
import { test } from "vitest";
import advTable from "../../src/index";



test("conv test", () => {
  const md = new MarkdownIt();
  md.use(advTable, {});
});

