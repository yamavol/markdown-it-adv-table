import fs from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";
import advTable from "../../lib/index.js";
const __dirname = import.meta.dirname;

const md = new MarkdownIt();
md.use(advTable, {});

const file = await fs.readFile(path.join(__dirname, "input.md"), "utf8");
const result = md.render(file);
await fs.writeFile(path.join(__dirname, "output.html"), result, "utf8");
