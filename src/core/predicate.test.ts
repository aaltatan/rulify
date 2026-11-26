import { describe, expect, it } from "vitest";
import cases from "./cases.json";
import {
  addNode,
  emptyGroup,
  moveNode,
  newCall,
  removeNode,
  setOperator,
  splitName,
  toggleInverse,
} from "./predicate.ts";
import { readSchema } from "./reader.ts";
import type { Json } from "./tree.ts";
import { makeValidator } from "./validate.ts";

const valid = makeValidator(cases.schemas["payroll-predicate"]);
const rules = readSchema(cases.schemas["payroll-predicate"]).rules;

describe("predicate tree", () => {
  it("makes a valid new call for every rule", () => {
    for (const rule of rules) expect(valid(newCall(rule) as Json), rule.name).toEqual({});

    expect(newCall(rules[1] as (typeof rules)[number])).toEqual({
      name: "grade__eq",
      args: ["a"],
      kwargs: {},
      inverse: false,
    });
  });

  it("adds, moves and removes nodes in nested groups", () => {
    const [years, grade] = rules.map(newCall);
    let tree = addNode(emptyGroup() as Json, [], emptyGroup());
    tree = addNode(tree, ["expressions", 0], years as Json as never);
    tree = addNode(tree, ["expressions", 0], grade as Json as never);

    expect(valid(tree)).toEqual({});

    const moved = moveNode(tree, ["expressions", 0, "expressions", 1], -1);

    expect(moved).toEqual({
      operator: "all",
      expressions: [{ operator: "all", expressions: [grade, years] }],
    });
    expect(moveNode(tree, ["expressions", 0, "expressions", 1], 1)).toBe(tree);
    expect(removeNode(moved, ["expressions", 0, "expressions", 0])).toEqual({
      operator: "all",
      expressions: [{ operator: "all", expressions: [years] }],
    });
    expect(removeNode(moved, [])).toEqual(emptyGroup());
  });

  it("switches all and any, and inverts a call", () => {
    const tree = addNode(emptyGroup() as Json, [], newCall(rules[3] as (typeof rules)[number]));

    expect(setOperator(tree, [], "any")).toMatchObject({ operator: "any" });
    expect(toggleInverse(tree, ["expressions", 0])).toMatchObject({
      expressions: [{ inverse: true }],
    });
  });

  it("splits a name at its last double underscore", () => {
    expect(splitName("employee__age__ge")).toEqual({ field: "employee__age", operator: "ge" });
    expect(splitName("is_married")).toEqual({ field: "is_married", operator: "" });
  });
});
