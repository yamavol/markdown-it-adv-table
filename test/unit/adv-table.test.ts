import MarkdownIt from "markdown-it";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CsvTableParser } from "../../src/csv-table.js";
import { FlatTableParser } from "../../src/flat-table.js";
import { advTable } from "../../src/index.js";
import { TableSpec } from "../../src/table.js";

vi.mock("../../src/flat-table.js");
vi.mock("../../src/csv-table.js");

// const { FlatTableParser: ActualFlatTableParser } = await vi.importActual<typeof import("../../src/flat-table.js")>("../../src/flat-table.js");
// const { CsvTableParser: ActualCsvTableParser } = await vi.importActual<typeof import("../../src/csv-table.js")>("../../src/csv-table.js");

describe("adv-table test", () => {

  beforeAll(() => {
    vi.mocked(FlatTableParser.new).mockImplementation(() => new FlatTableParser(new TableSpec({})));
    vi.mocked(CsvTableParser.new).mockImplementation(() => new CsvTableParser(new TableSpec({})));
  });
  
  describe.sequential("check default option names", () => {
    beforeEach(() => {
      vi.mocked(FlatTableParser.new).mockClear();
      vi.mocked(CsvTableParser.new).mockClear();
    }); 
    it("adv", () => {
      const input = "```table\n```";
      const _ = new MarkdownIt().use(advTable).render(input, {});
      expect(FlatTableParser.new).toHaveBeenCalled();
      expect(CsvTableParser.new).not.toHaveBeenCalled();
    });
    it("adv-csv", () => {
      const input = "```table format=csv\n```";
      const _ = new MarkdownIt().use(advTable).render(input, {});
      expect(FlatTableParser.new).not.toHaveBeenCalled();
      expect(CsvTableParser.new).toHaveBeenCalled();
    });
    it("adv-tsv", () => {
      const input = "```table format=tsv\n```";
      const _ = new MarkdownIt().use(advTable).render(input, {});
      expect(FlatTableParser.new).not.toHaveBeenCalled();
      expect(CsvTableParser.new).toHaveBeenCalled();
    });
    it("flat", () => {
      const input = "```flat-table\n```";
      expect(FlatTableParser.new).toHaveBeenCalledTimes(0);
      const _ = new MarkdownIt().use(advTable).render(input, {});
      expect(FlatTableParser.new).toHaveBeenCalled();
      expect(CsvTableParser.new).not.toHaveBeenCalled();
    });
    it("csv", () => {
      const input = "```csv-table\n```";
      const _ = new MarkdownIt().use(advTable).render(input, {});
      expect(FlatTableParser.new).not.toHaveBeenCalled();
      expect(CsvTableParser.new).toHaveBeenCalled();
    });
    it("tsv", () => {
      const input = "```tsv-table\n```";
      const _ = new MarkdownIt().use(advTable).render(input, {});
      expect(FlatTableParser.new).not.toHaveBeenCalled();
      expect(CsvTableParser.new).toHaveBeenCalled();
    });
  });
});

