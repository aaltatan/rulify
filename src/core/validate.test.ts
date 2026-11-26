import { describe, expect, it } from "vitest";
import cases from "./cases.json";
import { hasProblemsUnder, makeValidator } from "./validate.ts";

const ruleset = makeValidator(cases.schemas["payroll-ruleset"]);
const formula = makeValidator(cases.schemas["payroll-formula"]);
const GOLD = { name: "grade__eq", args: ["a"], kwargs: {}, inverse: false };

describe("makeValidator", () => {
  it("returns no problems for a valid definition", () => {
    expect(ruleset({ branches: [], otherwise: 0 })).toEqual({});
  });

  it("puts an unknown variable on its own node", () => {
    expect(formula({ operator: "add", expressions: ["salary", "salaryy"] })).toEqual({
      "$.expressions[1]": [{ keyword: "invalid", message: "must match one of the allowed shapes" }],
    });
  });

  it("puts a wrong choice on the argument", () => {
    const problems = ruleset({
      branches: [{ when: { ...GOLD, args: ["z"] }, then: 1 }],
      otherwise: 0,
    });

    expect(problems).toEqual({
      "$.branches[0].when.args[0]": [
        { keyword: "enum", message: "must be equal to one of the allowed values" },
      ],
    });
  });

  it("puts an unknown rule on the call, not on its arguments", () => {
    const problems = ruleset({
      branches: [{ when: { ...GOLD, name: "grade__eqq" }, then: 1 }],
      otherwise: 0,
    });

    expect(problems).toEqual({
      "$.branches[0].when": [
        { keyword: "invalid", message: "must match one of the allowed shapes" },
      ],
    });
  });

  it("finds problems inside a ruleset nested in a formula", () => {
    const nested = { when: { branches: [{ when: GOLD, then: "salaryy" }], otherwise: 0 } };
    const problems = formula({ operator: "add", expressions: [1, nested] });

    expect(Object.keys(problems)).toEqual(["$.expressions[1].when.branches[0].then"]);
  });

  it("reports a missing part where it is missing", () => {
    expect(Object.keys(ruleset({ branches: [] }))).toEqual(["$"]);
    expect(ruleset({ branches: [] }).$?.[0]?.keyword).toBe("required");
  });
});

describe("hasProblemsUnder", () => {
  const problems = { "$.branches[1].then": [{ keyword: "type", message: "" }] };

  it("finds a problem on the node or below it, not on a sibling sharing its prefix", () => {
    expect(hasProblemsUnder(problems, "$.branches[1]")).toBe(true);
    expect(hasProblemsUnder(problems, "$.branches[1].then")).toBe(true);
    expect(hasProblemsUnder(problems, "$.branches[1].when")).toBe(false);
    expect(hasProblemsUnder({ "$.branches[10]": [] }, "$.branches[1]")).toBe(false);
  });
});
