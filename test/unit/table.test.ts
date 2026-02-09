import { describe, expect, it } from "vitest";
import { CellState, ColSpecs, ColWidth, TableAttr, TableCell, TableSpec } from "../../src/table";

describe("colwidth", () => {
  it ("basic usage", () => {
    const cw = new ColWidth("100px");
    expect(cw.text).toBe("100px");
    expect(cw.hasUnit).toBe(true);
    expect(cw.relSize).toBe(0);
  });

  it ("relative size, mixed with units", () => {
    const cw1 = new ColWidth("2");
    const cw2 = new ColWidth("3");
    const cw3 = new ColWidth("50%");
    const all = [cw1, cw2, cw3];
    expect(ColWidth.widthPropertyValue(cw1, all)).toBe("calc((100% - (50%)) * 2 / 5)");
    expect(ColWidth.widthPropertyValue(cw2, all)).toBe("calc((100% - (50%)) * 3 / 5)");
    expect(ColWidth.widthPropertyValue(cw3, all)).toBe("50%");
  });

  it ("relative size, invalid equation", () => {
    const cw1 = new ColWidth("2");
    const cw2 = new ColWidth("2");
    const cw3 = new ColWidth("50%");
    const cw4 = new ColWidth("100%");
    const all = [cw1, cw2, cw3, cw4];
    expect(ColWidth.widthPropertyValue(cw1, all)).toBe("calc((100% - (50% + 100%)) * 2 / 4)");
    expect(ColWidth.widthPropertyValue(cw2, all)).toBe("calc((100% - (50% + 100%)) * 2 / 4)");
    expect(ColWidth.widthPropertyValue(cw3, all)).toBe("50%");
    expect(ColWidth.widthPropertyValue(cw4, all)).toBe("100%");
  });
});

describe("tablespec", () => {

  describe("colspec parse", () => {
    it ("from plain number", () => {
      const info = "cols=4";
      const attr = TableSpec.parseInfoString(info);
      const spec = new TableSpec(attr);
      expect(attr.cols).toBe("4");
      expect(spec.numCols).toBe(4);
    });

    it ("from plain number", () => {
      const info = "cols=10";
      const attr = TableSpec.parseInfoString(info);
      const spec = new TableSpec(attr);
      expect(attr.cols).toBe("10");
      expect(spec.numCols).toBe(10);
    });
    
    it ("from colspec string", () => {
      const info = "cols=\"100px,1,1,1,1\"";
      const attr = TableSpec.parseInfoString(info);
      const spec = new TableSpec(attr);
      expect(attr.cols).toBe("100px,1,1,1,1");
      expect(spec.numCols).toBe(5);
      expect(spec.colspecs.numCols).toBe(5);
      expect(spec.colspecs.colWidth(0).text).toBe("100px");
    });

    it ("from colspec string (wrong syntax?)", () => {
      const info = "cols=1,1,1,1,1";
      const attr = TableSpec.parseInfoString(info);
      const spec = new TableSpec(attr);
      expect(attr.cols).toBe("1,1,1,1,1");
      expect(spec.numCols).toBe(5);
      expect(spec.colspecs.numCols).toBe(5);
      expect(spec.colspecs.colWidth(0).text).toBe("1");
    });

    it("from unquoted size-unit (wrong syntax?)", () => {
      const info = "cols=100px";
      const attr = TableSpec.parseInfoString(info);
      const spec = new TableSpec(attr);
      expect(attr.cols).toBe("100px");
      expect(spec.numCols).toBe(1);
      expect(spec.colspecs.numCols).toBe(1);
      expect(spec.colspecs.colWidth(0).text).toBe("100px");
    });

    it("from quoted size-unit (wrong syntax?)", () => {
      const info = "cols=\"100px\"";
      const attr = TableSpec.parseInfoString(info);
      const spec = new TableSpec(attr);
      expect(attr.cols).toBe("100px");
      expect(spec.numCols).toBe(1);
      expect(spec.colspecs.numCols).toBe(1);
      expect(spec.colspecs.colWidth(0).text).toBe("100px");
    });
  });

  describe("parse classnames", () => {

    it ("multiple class names", () => {
      const info = "class=\"table stripe,nice modern\"";
      const attr = TableSpec.parseInfoString(info);
      expect(attr.class).toBe("table stripe,nice modern");
      
      const spec = new TableSpec(attr);
      expect(spec.classes).toEqual(["table", "stripe", "nice", "modern"]);
    });
  });

  describe("parse width", () => {
    it ("number with unit", () => {
      const info = "width=100px";
      const attr = TableSpec.parseInfoString(info);
      expect(attr.width).toBe("100px");
    });

    it ("relative width", () => {
      const info = "width=100%";
      const attr = TableSpec.parseInfoString(info);
      expect(attr.width).toBe("100%");
    });

    it ("no unit", () => {
      const info = "cols=\"1,1,1\" width=100";
      const attr = TableSpec.parseInfoString(info);
      expect(attr.width).toBe("100");
    });

    it ("no unit", () => {
      const info = "cols=\"1,1,1\" width=\"100\"";
      const attr = TableSpec.parseInfoString(info);
      expect(attr.width).toBe("100");
    });
  });
});

describe("colspecs", () => {
  it ("create colspecs", () => {
    const cols = new ColSpecs("1,1,1,1");
    expect(cols.numCols).toBe(4);
  });
  it ("create complex", () => {
    const cols = new ColSpecs("100px,50rem,1200%,1,,10,90lvmin");
    expect(cols.numCols).toBe(7);
    expect(cols.colSpec(0).width?.text).toBe("100px");
    expect(cols.colSpec(1).width?.text).toBe("50rem");
    expect(cols.colSpec(2).width?.text).toBe("1200%");
    expect(cols.colSpec(3).width?.text).toBe("1");
    expect(cols.colSpec(4).width).toBeUndefined();
    expect(cols.colSpec(5).width?.text).toBe("10");
    expect(cols.colSpec(6).width?.text).toBe("90lvmin");
    expect(cols.colWidthPropValue(5)).toBe("calc((100% - (100px + 50rem + 1200% + 90lvmin)) * 10 / 12)");
  });
});

describe("tablecell", () => {
  it ("basic usage", () => {
    const cell = new TableCell(0, 0, { colspan: 1, rowspan: 1 });

    expect(cell.is(0,0)).toBe(true);
    expect(cell.is(0,1)).toBe(false);
    expect(cell.is(1,0)).toBe(false);
    expect(cell.contains(0, 0)).toBe(true);
    expect(cell.contains(0, 1)).toBe(false);
    expect(cell.contains(1, 0)).toBe(false);
    expect(cell.contains(1, 1)).toBe(false);
  });
});

describe("cellstate", () => {

  it ("leftMost, rightMost", () => {
    const attr: TableAttr = {
      cols: "3",
    };
    const spec = new TableSpec(attr);
    const state = new CellState(spec);

    state.set(0, 0, { colspan: 2, rowspan: 2 });
    state.set(2, 1, { colspan: 2, rowspan: 1 });

    // -------------
    // | L     | R |
    // |       |---|
    // |       | R |
    // |-------|---|
    // | L |     R |
    // -------------

    expect(state.isLeftMost(0, -1)).toBe(true);
    expect(state.isLeftMost(0, 0)).toBe(true);
    expect(state.isLeftMost(0, 1)).toBe(true);
    expect(state.isLeftMost(0, 2)).toBe(false);
    expect(state.isLeftMost(0, 99)).toBe(false);
    expect(state.isLeftMost(1, 0)).toBe(true);
    expect(state.isLeftMost(1, 1)).toBe(true);
    expect(state.isLeftMost(1, 2)).toBe(false);
    expect(state.isLeftMost(2, 0)).toBe(true);
    expect(state.isLeftMost(2, 1)).toBe(false);
    expect(state.isLeftMost(2, 2)).toBe(false);

    expect(state.isRightMost(0, -1)).toBe(false);
    expect(state.isRightMost(0, 0)).toBe(false);
    expect(state.isRightMost(0, 1)).toBe(false);
    expect(state.isRightMost(0, 2)).toBe(true);
    expect(state.isRightMost(0, 99)).toBe(true);
    expect(state.isRightMost(1, 0)).toBe(false);
    expect(state.isRightMost(1, 1)).toBe(false);
    expect(state.isRightMost(1, 2)).toBe(true);
    expect(state.isRightMost(2, 0)).toBe(false);
    expect(state.isRightMost(2, 1)).toBe(true);
    expect(state.isRightMost(2, 2)).toBe(true);
  });

  it ("rowFirst, rowLast", () => {
    const attr: TableAttr = {
      cols: "3",
    };
    const spec = new TableSpec(attr);
    const state = new CellState(spec);

    state.set(0, 0, { colspan: 1, rowspan: 3 });
    state.set(0, 1, { colspan: 1, rowspan: 2 });

    // -------------
    // | F |   | L |
    // |   |   |---|
    // |   |   |F/L|
    // |   |---|---|
    // |   | F | L |
    // -------------

    expect(state.isRowFirst(0, -1)).toBe(false);
    expect(state.isRowFirst(0, 0)).toBe(true);
    expect(state.isRowFirst(0, 1)).toBe(false);
    expect(state.isRowFirst(1, 0)).toBe(false);
    expect(state.isRowFirst(1, 1)).toBe(false);
    expect(state.isRowFirst(1, 2)).toBe(true);
    expect(state.isRowFirst(2, 0)).toBe(false);
    expect(state.isRowFirst(2, 1)).toBe(true);
    expect(state.isRowFirst(2, 2)).toBe(false);
    
    expect(state.isRowLast(0, 0)).toBe(false);
    expect(state.isRowLast(0, 1)).toBe(false);
    expect(state.isRowLast(0, 2)).toBe(true);
    expect(state.isRowLast(1, 0)).toBe(false);
    expect(state.isRowLast(1, 1)).toBe(false);
    expect(state.isRowLast(1, 2)).toBe(true);
    expect(state.isRowLast(2, 0)).toBe(false);
    expect(state.isRowLast(2, 1)).toBe(false);
    expect(state.isRowLast(2, 2)).toBe(true);
  });

  it ("rowFirst, rowLast test2", () => {
    const attr: TableAttr = {
      cols: "3",
    };
    const spec = new TableSpec(attr);
    const state = new CellState(spec);

    state.set(0, 0, { colspan: 2, rowspan: 1 });
    state.set(1, 0, { colspan: 1, rowspan: 2 });
    state.set(2, 1, { colspan: 2, rowspan: 1 });

    // -------------
    // | F     | L |
    // |-------|---|
    // | F |   | L |
    // |   |-------|
    // |   |F/L    |
    // -------------

    expect(state.isRowFirst(0, -1)).toBe(false);
    expect(state.isRowFirst(0, 0)).toBe(true);
    expect(state.isRowFirst(0, 1)).toBe(false);
    expect(state.isRowFirst(1, 0)).toBe(true);
    expect(state.isRowFirst(1, 1)).toBe(false);
    expect(state.isRowFirst(1, 2)).toBe(false);
    expect(state.isRowFirst(2, 0)).toBe(false);
    expect(state.isRowFirst(2, 1)).toBe(true);
    expect(state.isRowFirst(2, 2)).toBe(false);
    
    expect(state.isRowLast(0, 0)).toBe(false);
    expect(state.isRowLast(0, 1)).toBe(false);
    expect(state.isRowLast(0, 2)).toBe(true);
    expect(state.isRowLast(1, 0)).toBe(false);
    expect(state.isRowLast(1, 1)).toBe(false);
    expect(state.isRowLast(1, 2)).toBe(true);
    expect(state.isRowLast(2, 0)).toBe(false);
    expect(state.isRowLast(2, 1)).toBe(true);
    expect(state.isRowLast(2, 2)).toBe(false);
  });

});

