import { describe, expect, it } from "vitest";
import { merge } from "../../src/merge.js";

describe("merge", () => {

  it ("basic merge", () => {
    const a = { a: 1 };
    const b = { b: 2 };
    const c = merge(a, b);
    expect(c).toHaveProperty("a");
    expect(c).toHaveProperty("b");
    expect(c.a).toBe(1);
    expect(c.b).toBe(2);
  });

  it ("merge primitive (number)", () => {
    const a = { a: 1 };
    const b = 2;
    const c = merge(a, b);
    expect(c).toBeTypeOf("number");
    expect(c).toBe(2);
  });

  it ("merge primitive (undefined)", () => {
    const a = { a: 1 };
    const b = undefined;
    const c = merge(a, b);
    expect(c).toStrictEqual(a);
  });
  

  it ("merge ignores undefined", () => {
    const a = { a: 1 }; 
    const b = { a: undefined };

    const x = merge(a, b);
    expect(x.a).toBe(1);
  });

  it ("merge object with circular reference", () => {
    const a = { a: 1, b: undefined };
    const b = { b: 2, a };
    (a as any).b = b;

    expect(a.b).toBe(b);
    expect(b.a).toBe(a);

    const m = merge({}, a);

    expect(m.a).toBe(1);
    expect(m.b).toHaveProperty("b");
    expect(m.b).toHaveProperty("a");
    expect((m.b as any).a).toStrictEqual(a);
  });

  it ("merge object with array", () => {
    const a = { a: 1, b: [1,2,3,4,5]};
    const b = { a: 2, b: [6,7,8,9,0]};
    const c = merge(a, b);

    expect(c.a).toBe(2);
    expect(c.b).toStrictEqual([6,7,8,9,0]);
  });

  it ("methods are ignored", () => {
    const date = new Date();
    const a = {};
    const b = merge(a, date);
    expect(b.toISOString).toBeUndefined();
  });

  it ("block malcious keys", () => {
    const inject = () => alert("hello");
    const mal = {
      constructor: inject,
      prototype: inject,
      "__safe__": inject,
    };

    const a = merge({}, mal);
    expect(Object.getPrototypeOf(a)).toBe(Object.prototype);
    expect(Object.hasOwn(a, "__proto__")).toBe(false);
    expect(a.constructor).toBeUndefined;
    expect(a.prototype).toBeUndefined;
    expect(a.__safe__).toBe(inject);
    
  });

});