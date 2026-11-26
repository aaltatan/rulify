// Ajv (Draft 2020-12) over the uploaded schema; errors keyed by JSON path as the Python
// compilers write them (`$.branches[0].when`), so each sits on the node that caused it.
import { Ajv2020, type ErrorObject } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { type Json, pathKey } from "./tree.ts";

export type Problem = { keyword: string; message: string };
export type Problems = Record<string, Problem[]>;
export type Validator = (definition: Json) => Problems;

const X_KEYWORDS = ["x-kind", "x-label", "x-description", "x-field", "x-operator", "x-choices"];

/** A validator for `schema`; throws Ajv's error when the schema itself does not compile. */
export function makeValidator(schema: object): Validator {
  // argument schemas are `prefixItems` with `items: false`, which strict tuples warns about
  const ajv = new Ajv2020({ allErrors: true, strictTuples: false });
  ajv.addVocabulary(X_KEYWORDS);
  addFormats.default(ajv);
  const validate = ajv.compile(schema);

  return (definition) => (validate(definition) ? {} : byNode(validate.errors ?? []));
}

/**
 * `oneOf` reports every alternative it tried at every level, so an error deep inside an
 * operation also shows up on the operation and on the root. Only the deepest paths are kept:
 * those no other error goes below. Rules not named by a call are dropped first.
 */
function byNode(all: ErrorObject[]): Problems {
  const errors = withoutOtherRules(all);
  const paths = [...new Set(errors.map((error) => error.instancePath))];
  const deepest = paths.filter((path) => !paths.some((other) => other.startsWith(`${path}/`)));
  const problems: Problems = {};

  for (const path of deepest) {
    const found = errors.filter((error) => error.instancePath === path);
    // a node no alternative accepts: one plain problem, not every alternative's complaint
    const own = found.some((error) => error.keyword === "oneOf" || error.keyword === "anyOf")
      ? [{ keyword: "invalid", message: "must match one of the allowed shapes" }]
      : found.map((error) => ({ keyword: error.keyword, message: error.message ?? error.keyword }));

    problems[toKey(path)] = own.filter(
      (problem, i) => own.findIndex((other) => other.keyword === problem.keyword) === i,
    );
  }

  return problems;
}

const NAME_CONST = "/properties/name/const";

/**
 * A call is checked against every rule; a rule whose `name` does not match was not meant, so
 * all its complaints about that call go. A call no rule names keeps only the `oneOf` failure,
 * which then sits on the call itself.
 */
function withoutOtherRules(errors: ErrorObject[]): ErrorObject[] {
  const others = errors
    .filter((error) => error.keyword === "const" && error.schemaPath.endsWith(NAME_CONST))
    .map((error) => ({
      rule: `${error.schemaPath.slice(0, -NAME_CONST.length)}/`,
      call: error.instancePath.slice(0, -"/name".length),
    }));

  return errors.filter(
    (error) =>
      !others.some(
        ({ rule, call }) =>
          error.schemaPath.startsWith(rule) &&
          (error.instancePath === call || error.instancePath.startsWith(`${call}/`)),
      ),
  );
}

/** `/branches/0/when` -> `$.branches[0].when`. */
function toKey(pointer: string): string {
  const steps = pointer
    .split("/")
    .slice(1)
    .map((step) => step.replaceAll("~1", "/").replaceAll("~0", "~"))
    .map((step) => (/^\d+$/.test(step) ? Number(step) : step));

  return pathKey(steps);
}

/** Whether any problem sits on `key` (`$.branches[0]`) or on a node below it. */
export function hasProblemsUnder(problems: Problems, key: string): boolean {
  return Object.keys(problems).some(
    (path) => path === key || path.startsWith(`${key}.`) || path.startsWith(`${key}[`),
  );
}

/** What the code view makes of typed text: a definition to take, or why not (null: not JSON). */
export type Reading =
  | { ok: true; definition: Json }
  | { ok: false; path: string; problem: Problem }
  | { ok: false; path: null; problem: null };

/** Typed JSON is taken only when it parses and validates; else the first problem says why. */
export function readDefinition(text: string, validate: Validator): Reading {
  let definition: Json;

  try {
    definition = JSON.parse(text) as Json;
  } catch {
    return { ok: false, path: null, problem: null };
  }

  const [path, list] = Object.entries(validate(definition))[0] ?? [];

  return path && list?.[0] ? { ok: false, path, problem: list[0] } : { ok: true, definition };
}
