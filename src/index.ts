import { PluginSimple, PluginWithOptions } from "markdown-it";
import type { StateBlock } from "markdown-it/index.js";
import { AdvTableParser } from "./adv-table.js";
import { CsvTableParser } from "./csv-table.js";
import { debug } from "./debug.js";
import { fence_custom, Parser } from "./fence.js";
import { FlatTableParser } from "./flat-table.js";
import { merge } from "./merge.js";

export interface PluginOption {
  name: string
}

const langNames = {
  adv: "table",
  flat: "flat-table",
  csv: "csv-table",
  tsv: "tsv-table",
};

const defaultOption: PluginOption = {
  name: langNames.adv,
};

export function unifiedParser(option: PluginOption): Parser {
  return (info: string, state: StateBlock, startLine: number, endLine: number) => {

    if (debug.isEnabled()) {
      debug(">> table parse start");
      debug("info: " + info);
      debug("range:", startLine, endLine);
      debug("start:", state.sCount[startLine]);
      debug("blkIndent:", state.blkIndent);

      const start = state.bMarks[startLine];
      const max = state.eMarks[endLine];
      const content = state.src.slice(start, max);
      let lines = content.split("\n");
      const summary = lines.length < 5 ? content : [
        lines[0], 
        lines[1], 
        " :", 
        lines[lines.length - 2], 
        lines[lines.length - 1]
      ].join("\n");
      debug("content:\n" + summary);
    }

    const lang = info.slice(0, info.search(/\s|$/));
    const params = info.slice(lang.length + 1);
    if (lang === option.name) {
      const parser = new AdvTableParser(params);
      parser.parse(state, startLine + 1, endLine);
    }
    else if (lang === langNames.flat) {
      const parser = FlatTableParser.new(params, state, startLine + 1, endLine);
      parser.parse(state, startLine + 1, endLine);
    }
    else if (lang === langNames.csv) {
      const parser = CsvTableParser.new(params, ",");
      parser.parse(state, startLine + 1, endLine);
    }
    else if (lang === langNames.tsv) {
      const parser = CsvTableParser.new(params, "\t");
      parser.parse(state, startLine + 1, endLine);
    }
  };
}


export const advTable: PluginWithOptions<PluginOption> = (md, option?) => {
  const opts = merge(defaultOption, option);
  const awareNames = [
    option?.name ?? langNames.adv,
    langNames.flat,
    langNames.csv,
    langNames.tsv
  ];
  const parser = unifiedParser(opts);
  const rule = fence_custom(awareNames, parser);
  md.block.ruler.before("fence", "adv_table", rule);
};

export const flatTable: PluginSimple = (md) => {
  const parser = unifiedParser(defaultOption);
  const rule = fence_custom(langNames.flat, parser);
  md.block.ruler.before("fence", "flat_table", rule);
};

export const csvTable: PluginSimple = (md) => {
  const parser = unifiedParser(defaultOption);
  const rule = fence_custom(langNames.csv, parser);
  md.block.ruler.before("fence", "csv_table", rule);
};

export const tsvTable: PluginSimple = (md) => {
  const parser = unifiedParser(defaultOption);
  const rule = fence_custom(langNames.tsv, parser);
  md.block.ruler.before("fence", "tsv_table", rule);
};


export default advTable;



