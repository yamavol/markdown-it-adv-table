import type MarkdownIt from "markdown-it";
import type { PluginWithOptions } from "markdown-it";
import { fence_custom } from "./fence.js";
import { flatTableParser } from "./table.js";

export interface Options {
  
}

const defaultOptions: Options = {};


function createRules(md: MarkdownIt, option?: Partial<Options>) {
  const options = { ...defaultOptions, ...option };

  const adv_table = fence_custom("{table}", flatTableParser);

  return {
    adv_table,
  };
}

export const plugin: PluginWithOptions<Options> = (md, option?) => {
  const rules = createRules(md, option);

  md.block.ruler.before("fence", "adv_table", rules.adv_table);
};

export default plugin;



