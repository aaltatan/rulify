import { describe, expect, it } from "vitest";
import cases from "./cases.json";
import { readSchema, SchemaError, subschemas } from "./reader.ts";

const { schemas } = cases;

describe("readSchema", () => {
  it("reads a ruleset's rules, variables, operators and functions", () => {
    const catalog = readSchema(schemas["payroll-ruleset"]);

    expect(catalog.kind).toBe("ruleset");
    expect(catalog.rules.map((rule) => rule.name)).toEqual([
      "years__ge",
      "grade__eq",
      "children__ge",
      "is_married",
    ]);
    expect(catalog.variables.map((variable) => variable.name)).toEqual([
      "salary",
      "years",
      "children",
    ]);
    expect(catalog.operators).toContain("floor_divide");
    expect(catalog.functions).toEqual(
      expect.arrayContaining(["round", "floor", "sqrt", "absolute"]),
    );
    expect(catalog.when).toBe(true);
  });

  it("keeps labels, splits and choices as the libraries wrote them", () => {
    const [years, grade] = readSchema(schemas["payroll-ruleset"]).rules;

    expect(years?.label).toEqual({ en: "Years of service at least", ar: "سنوات الخدمة لا تقل عن" });
    expect([years?.field, years?.operator]).toEqual(["years", "ge"]);
    expect(years?.args[0]?.label).toEqual({ en: "Years", ar: "السنوات" });
    expect(grade?.args[0]?.choices?.map((choice) => choice.value)).toEqual(["a", "b", "c"]);
    expect(grade?.args[0]?.initial).toBe("a");
  });

  it("reads keyword arguments with their required flag", () => {
    const children = readSchema(schemas["payroll-ruleset"]).rules[2];

    expect(children?.kwargs.map((param) => [param.name, param.required, param.initial])).toEqual([
      ["count", false, 0],
    ]);
  });

  it("finds the conditions inside a formula's when node", () => {
    const catalog = readSchema(schemas["payroll-formula"]);

    expect(catalog.kind).toBe("formula");
    expect(catalog.rules).toHaveLength(4);
    expect(catalog.variables[0]).toEqual({
      name: "salary",
      label: { en: "Salary", ar: "الراتب" },
      description: "Return the monthly base salary.",
    });
  });

  it("reads a predicate schema without formulas", () => {
    const catalog = readSchema(schemas["payroll-predicate"]);

    expect([catalog.kind, catalog.variables, catalog.operators, catalog.when]).toEqual([
      "predicate",
      [],
      [],
      false,
    ]);
  });

  it("refuses a schema that is not from the libraries", () => {
    expect(() => readSchema({ type: "object" })).toThrow(SchemaError);
    expect(() => readSchema([])).toThrow(SchemaError);
  });
});

describe("subschemas", () => {
  it("finds the schema for each kind a schema can edit", () => {
    const kinds = (name: keyof typeof schemas) =>
      Object.entries(subschemas(schemas[name])).map(([kind, schema]) => [
        kind,
        (schema as Record<string, unknown>)["x-kind"],
      ]);

    expect(kinds("payroll-ruleset")).toEqual([
      ["ruleset", "ruleset"],
      ["predicate", "predicate"],
      ["formula", "formula"],
    ]);
    expect(kinds("payroll-formula")).toEqual([
      ["predicate", "predicate"],
      ["formula", "formula"],
    ]);
    expect(kinds("payroll-predicate")).toEqual([["predicate", "predicate"]]);
    expect(subschemas({ type: "object" })).toEqual({});
  });
});
