// cases.json is written by `pnpm sync` from the Python libraries: what Python prints for each
// definition, and its Python code. The editor's output must equal it, case for case.

import { expect, describe as group, it } from "vitest";
import cases from "./cases.json";
import { describe } from "./describe.ts";
import { python } from "./python.ts";
import type { Kind } from "./reader.ts";
import type { Json } from "./tree.ts";
import { makeValidator } from "./validate.ts";

const all = cases.cases.map((item) => [item.name, item] as const);
const schemaOf = (name: string) => cases.schemas[name as keyof typeof cases.schemas];

group("cases.json from the Python libraries", () => {
  it.each(all)("%s reads as Python prints it", (_, item) => {
    expect(describe(item.kind as Kind, item.definition as Json)).toBe(item.prints);
  });

  it.each(all)("%s is the same Python code", (_, item) => {
    expect(python(item.kind as Kind, item.definition as Json)).toBe(item.python);
  });

  it.each(all)("%s is valid for its schema", (_, item) => {
    const schema = schemaOf(item.schema);

    expect(makeValidator(schema)(item.definition as Json)).toEqual({});
    expect(schema["x-kind"]).toBe(item.kind);
  });
});
