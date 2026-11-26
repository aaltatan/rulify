import { describe, expect, it } from "vitest";
import cases from "./cases.json";
import { addBranch, emptyRuleset, moveBranch, removeBranch, setLabel } from "./ruleset.ts";
import type { Json } from "./tree.ts";
import { makeValidator } from "./validate.ts";

const valid = makeValidator(cases.schemas["payroll-ruleset"]);
const validFormula = makeValidator(cases.schemas["payroll-formula"]);

describe("ruleset operations", () => {
  it("adds valid branches and labels them", () => {
    let tree = addBranch(emptyRuleset() as Json, []);
    tree = addBranch(tree, []);
    tree = setLabel(tree, [], 1, "senior");

    expect(valid(tree)).toEqual({});
    expect(tree).toMatchObject({ branches: [{ then: 0 }, { label: "senior" }] });
    expect(setLabel(tree, [], 1, "  ")).toEqual({
      ...(tree as object),
      branches: [
        { when: { operator: "all", expressions: [] }, then: 0 },
        { when: { operator: "all", expressions: [] }, then: 0 },
      ],
    });
  });

  it("moves and removes branches in order", () => {
    let tree = addBranch(addBranch(emptyRuleset() as Json, []), []);
    tree = setLabel(setLabel(tree, [], 0, "a"), [], 1, "b");
    const moved = moveBranch(tree, [], 1, 0);

    expect((moved as { branches: { label: string }[] }).branches.map((b) => b.label)).toEqual([
      "b",
      "a",
    ]);
    expect(moveBranch(tree, [], 0, 5)).toBe(tree);
    expect((removeBranch(moved, [], 0) as { branches: unknown[] }).branches).toHaveLength(1);
  });

  it("works on a when node inside a formula", () => {
    const formula = { operator: "add", expressions: ["salary", { when: emptyRuleset() }] } as Json;
    const path = ["expressions", 1, "when"];
    const tree = setLabel(addBranch(formula, path), path, 0, "family");

    expect(validFormula(tree)).toEqual({});
    expect(tree).toMatchObject({
      expressions: ["salary", { when: { branches: [{ label: "family" }] } }],
    });
  });
});
