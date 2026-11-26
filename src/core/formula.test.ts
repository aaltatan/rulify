import { describe, expect, it } from "vitest";
import cases from "./cases.json";
import {
  addTerm,
  apply,
  convert,
  type Formula,
  functionOf,
  kindOf,
  operate,
  removeTerm,
  setFunction,
} from "./formula.ts";
import type { Json } from "./tree.ts";
import { makeValidator } from "./validate.ts";

const valid = makeValidator(cases.schemas["payroll-formula"]);
const SUM: Formula = { operator: "add", expressions: ["salary", 100] };

describe("formula tree", () => {
  it("tells the kinds apart", () => {
    expect(
      ["salary", 1, SUM, { floor: 1 }, { when: { branches: [], otherwise: 0 } }].map((n) =>
        kindOf(n as Formula),
      ),
    ).toEqual(["variable", "number", "operation", "function", "when"]);
    expect(functionOf({ round: 1, ndigits: 2 })).toBe("round");
    expect(functionOf(SUM)).toBeNull();
  });

  it("converts a node to every kind and stays valid", () => {
    for (const kind of ["number", "variable", "operation", "function", "when"] as const) {
      const node = convert(SUM, kind, "salary", "floor");

      expect(valid(node as Json), kind).toEqual({});
    }

    expect(convert(SUM, "operation", "salary")).toBe(SUM);
    expect(convert(SUM, "when", "salary")).toEqual({ when: { branches: [], otherwise: SUM } });
  });

  it("wraps a node in a function or an operation", () => {
    expect(apply("salary", "round")).toEqual({ round: "salary", ndigits: 2 });
    expect(apply("salary", "sqrt")).toEqual({ sqrt: "salary" });
    expect(operate("salary", "multiply")).toEqual({
      operator: "multiply",
      expressions: ["salary", 0],
    });
  });

  it("changes a function and keeps its value", () => {
    expect(setFunction({ round: "salary", ndigits: 3 }, "floor")).toEqual({ floor: "salary" });
    expect(setFunction({ floor: "salary" }, "round")).toEqual({ round: "salary", ndigits: 2 });
    expect(setFunction({ round: "salary", ndigits: 3 }, "round")).toEqual({
      round: "salary",
      ndigits: 3,
    });
  });

  it("adds and removes terms, never below two", () => {
    const tree = { round: SUM, ndigits: 2 } as Json;
    const three = addTerm(tree, ["round"]);

    expect(three).toEqual({
      round: { operator: "add", expressions: ["salary", 100, 0] },
      ndigits: 2,
    });
    expect(removeTerm(three, ["round"], 0)).toEqual({
      round: { operator: "add", expressions: [100, 0] },
      ndigits: 2,
    });
    expect(removeTerm(tree, ["round"], 0)).toBe(tree);
    expect(valid(three)).toEqual({});
  });
});
