import { describe, expect, it } from "vitest";
import { CellState, ColSpecs, TableAttr, TableCell, TableSpec } from "../../src/table";


describe("tablespec", () => {

  describe("colspec parse", () => {

    it ("from plain number", () => {
      const info = "cols=4";
      const attr = TableSpec.parseInfoString(info);
      const spec = new TableSpec(attr);
      expect(spec.numCols).toBe(4);
    });
    
    it ("from colspec string", () => {
      const info = "cols=\"1,1,1,1,1\"";
      const attr = TableSpec.parseInfoString(info);
      const spec = new TableSpec(attr);
      expect(spec.numCols).toBe(5);
    });

    it ("from colspec string (wrong syntax?)", () => {
      const info = "cols=1,1,1,1,1";
      const attr = TableSpec.parseInfoString(info);
      const spec = new TableSpec(attr);
      expect(spec.numCols).toBe(1);
    });
  });
});

describe("colspecs", () => {
  it ("create colspecs", () => {
    const cols = new ColSpecs("1,1,1,1");
    expect(cols.numCols).toBe(4);
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

