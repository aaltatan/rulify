// cases.json is written by `pnpm sync` from the Python libraries. Phase 2 checks the editor's
// output against it case for case; here, that every definition is valid for its schema.

import { Ajv2020 } from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import cases from "./cases.json";

const X_KEYWORDS = ["x-kind", "x-label", "x-description", "x-field", "x-operator", "x-choices"];

function validatorFor(schema: object) {
  const ajv = new Ajv2020({ allErrors: true, strictTuples: false });
  ajv.addVocabulary(X_KEYWORDS);

  return ajv.compile(schema);
}

describe("cases.json from the Python libraries", () => {
  it.each(cases.cases.map((item) => [item.name, item] as const))("%s is valid", (_, item) => {
    const schema = cases.schemas[item.schema as keyof typeof cases.schemas];
    const validate = validatorFor(schema);

    expect(validate(item.definition), JSON.stringify(validate.errors)).toBe(true);
    expect(schema["x-kind"]).toBe(item.kind);
  });

  it("rejects what the schema does not allow", () => {
    const validate = validatorFor(cases.schemas["payroll-ruleset"]);

    expect(validate({ otherwise: "salaryy" })).toBe(false);
    expect(
      validate({ otherwise: { when: { branches: [], otherwise: "salary" }, label: "x" } }),
    ).toBe(false);
  });
});
