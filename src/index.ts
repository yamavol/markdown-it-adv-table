import { PluginWithOptions } from "markdown-it";
import type { StateBlock } from "markdown-it/index.js";
import { AdvTableParser } from "./adv-table.js";
import { CsvTableParser } from "./csv-table.js";
import { debug } from "./debug.js";
import { fence_custom, Parser } from "./fence.js";
import { FlatTableParser } from "./flat-table.js";
import { merge } from "./merge.js";
export interface PluginOption {
  names: {
    adv: string;
    flat: string;
    csv: string;
    tsv: string;
  }
}

export interface PluginOptionSingle {
  name: string
}

const defaultOptions: PluginOption = {
  names: {
    adv: "table",
    flat: "flat-table",
    csv: "csv-table",
    tsv: "tsv-table"
  }
};

const plainNames: typeof defaultOptions.names = {
  adv: "",
  flat: "",
  csv: "",
  tsv: "",
};

function getAllNames(option: PluginOption) {
  return [
    option.names.adv,
    option.names.flat,
    option.names.csv,
    option.names.tsv
  ];
}

export function createParser(option: PluginOption): Parser {
  
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

    if (lang === option.names.adv) {
      const parser = new AdvTableParser(params);
      parser.parse(state, startLine + 1, endLine);
    }
    else if (lang === option.names.flat) {
      const parser = FlatTableParser.new(info, state, startLine + 1, endLine);
      parser.parse(state, startLine + 1, endLine);
    }
    else if (lang === option.names.csv) {
      const parser = CsvTableParser.new(params, ",");
      parser.parse(state, startLine + 1, endLine);
    }
    else if (lang === option.names.tsv) {
      const parser = CsvTableParser.new(params, "\t");
      parser.parse(state, startLine + 1, endLine);
    }
  };
}

export const advTable: PluginWithOptions<PluginOption> = (md, option?) => {
  const opts = merge(defaultOptions, option);
  const parser = createParser(opts);
  const rule = fence_custom(getAllNames(opts), parser);
  md.block.ruler.before("fence", "adv_table", rule);
};

export const flatTable: PluginWithOptions<PluginOptionSingle> = (md, option?) => {
  const defaultNames = merge(plainNames, { flat: defaultOptions.names.flat});
  const names = merge(defaultNames, { flat: option?.name });
  const opts = merge(defaultOptions, { names });
  const parser = createParser(opts);
  const rule = fence_custom(getAllNames(opts), parser);
  md.block.ruler.before("fence", "csv_table", rule);
};

export const csvTable: PluginWithOptions<PluginOptionSingle> = (md, option?) => {
  const defaultNames = merge(plainNames, { csv: defaultOptions.names.csv});
  const names = merge(defaultNames, { csv: option?.name });
  const opts = merge(defaultOptions, { names });
  const parser = createParser(opts);
  const rule = fence_custom(getAllNames(opts), parser);
  md.block.ruler.before("fence", "csv_table", rule);
};

export const tsvTable: PluginWithOptions<PluginOptionSingle> = (md, option?) => {
  const defaultNames = merge(plainNames, { tsv: defaultOptions.names.csv});
  const names = merge(defaultNames, { tsv: option?.name });
  const opts = merge(defaultOptions, { names });
  const parser = createParser(opts);
  const rule = fence_custom(getAllNames(opts), parser);
  md.block.ruler.before("fence", "csv_table", rule);
};


export default advTable;



