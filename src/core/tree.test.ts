import { describe, expect, it } from "vitest";
import { at, pathKey, setAt } from "./tree.ts";

describe("tree paths", () => {
  const tree = { branches: [{ when: 1, then: 2 }], otherwise: 0 };

  it("reads and replaces by path, leaving the input alone", () => {
    expect(at(tree, ["branches", 0, "then"])).toBe(2);
    expect(at(tree, ["branches", 3, "then"])).toBeUndefined();
    expect(setAt(tree, ["branches", 0, "then"], 5)).toEqual({
      branches: [{ when: 1, then: 5 }],
      otherwise: 0,
    });
    expect(tree.branches[0]?.then).toBe(2);
    expect(setAt(tree, [], 7)).toBe(7);
  });

  it("writes paths as the libraries do", () => {
    expect(pathKey(["branches", 0, "when", "expressions", 1])).toBe(
      "$.branches[0].when.expressions[1]",
    );
    expect(pathKey([])).toBe("$");
  });
});
