// A schema exported by the libraries -> what the editor may offer. The root's `x-kind` says what
// the document is; the predicate and formula schemas are found where the libraries put them
// (see CLAUDE.md, "Shapes rulify relies on"). Labels stay as texts; `textIn` picks the language.
import type { Text } from "./i18n.ts";
import type { Json } from "./tree.ts";

export type Kind = "ruleset" | "predicate" | "formula";
type Schema = { [key: string]: Json };

export type Choice = { value: Json; label: Text };
export type Param = {
  name: string;
  schema: Schema;
  required: boolean;
  /** What a new call sends for it: its default, its first choice, or a zero of its type. */
  initial: Json;
  label?: Text;
  description?: Text;
  choices?: Choice[];
};
export type RuleInfo = {
  name: string;
  label?: Text;
  description?: string;
  field?: string;
  operator?: string;
  args: Param[];
  kwargs: Param[];
};
export type VariableInfo = { name: string; label?: Text; description?: string };
export type Catalog = {
  kind: Kind;
  rules: RuleInfo[];
  variables: VariableInfo[];
  operators: string[];
  functions: string[];
  /** Whether a formula may hold a `{"when": <ruleset>}` node. */
  when: boolean;
};

export class SchemaError extends Error {}

const KINDS: readonly Kind[] = ["ruleset", "predicate", "formula"];

export function readSchema(root: unknown): Catalog {
  if (!isObject(root) || !KINDS.includes(root["x-kind"] as Kind)) {
    throw new SchemaError(
      "Not a rulify schema: the root has no x-kind of ruleset, predicate or formula.",
    );
  }

  const kind = root["x-kind"] as Kind;
  const defs = (root.$defs ?? {}) as Record<string, Schema>;
  const formula = kind === "formula" ? root : kind === "ruleset" ? defs.value : undefined;
  const whenNode = formula
    ? formulaNodes(formula).find((node) => "when" in props(node))
    : undefined;
  const predicate =
    kind === "predicate"
      ? root
      : kind === "ruleset"
        ? defs.condition
        : ((whenNode?.$defs as Record<string, Schema> | undefined)?.["when-condition"] ??
          undefined);

  return {
    kind,
    rules: predicate ? readRules(predicate) : [],
    variables: formula ? readVariables(formula) : [],
    operators: formula ? readOperators(formula) : [],
    functions: formula ? readFunctions(formula) : [],
    when: whenNode !== undefined,
  };
}

// -----------------------
// predicates
// -----------------------

function readRules(predicate: Schema): RuleInfo[] {
  const expression = ((predicate.$defs ?? {}) as Record<string, Schema>).expression ?? {};

  return ((expression.oneOf ?? []) as Schema[])
    .filter((item) => isObject(props(item).name))
    .map((item) => {
      const { args, kwargs } = props(item) as Record<string, Schema>;
      const required = new Set((kwargs?.required ?? []) as string[]);
      const kwargsProps = props(kwargs ?? {});

      return omitUndefined<RuleInfo>({
        name: String(props(item).name?.const),
        label: item["x-label"] as Text | undefined,
        description: item.description as string | undefined,
        field: item["x-field"] as string | undefined,
        operator: item["x-operator"] as string | undefined,
        args: ((args?.prefixItems ?? []) as Schema[]).map((schema, index) =>
          // a positional argument with a default may be left out; JSON has no names for them
          readParam(`${index}`, schema, !("default" in schema)),
        ),
        kwargs: Object.entries(kwargsProps).map(([name, schema]) =>
          readParam(name, schema as Schema, required.has(name)),
        ),
      });
    });
}

function readParam(name: string, schema: Schema, required: boolean): Param {
  const choices = schema["x-choices"] as Choice[] | undefined;

  return omitUndefined<Param>({
    name,
    schema,
    required,
    initial: initialOf(schema, choices),
    label: schema["x-label"] as Text | undefined,
    description: schema["x-description"] as Text | undefined,
    choices,
  });
}

function initialOf(schema: Schema, choices: Choice[] | undefined): Json {
  if ("default" in schema) return schema.default as Json;

  if (choices?.length) return (choices[0] as Choice).value;

  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0] as Json;

  switch (schema.type) {
    case "integer":
    case "number":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    case "null":
      return null;
    default:
      return "";
  }
}

// -----------------------
// formulas
// -----------------------

function formulaNodes(formula: Schema): Schema[] {
  const defs = (formula.$defs ?? {}) as Record<string, Schema>;

  return (defs.formula?.oneOf ?? []) as Schema[];
}

function readVariables(formula: Schema): VariableInfo[] {
  const variable = ((formula.$defs ?? {}) as Record<string, Schema>).variable;

  return ((variable?.oneOf ?? []) as Schema[]).map((item) =>
    omitUndefined<VariableInfo>({
      name: String(item.const),
      label: item["x-label"] as Text | undefined,
      description: item.description as string | undefined,
    }),
  );
}

function readOperators(formula: Schema): string[] {
  const operation = formulaNodes(formula).find((node) => "operator" in props(node));

  return ((props(operation ?? {}).operator as Schema | undefined)?.enum ?? []) as string[];
}

function readFunctions(formula: Schema): string[] {
  return formulaNodes(formula)
    .filter((node) => !("operator" in props(node)) && !("when" in props(node)))
    .map((node) => (node.required as string[] | undefined)?.[0])
    .filter((name): name is string => typeof name === "string");
}

// -----------------------
// helpers
// -----------------------

function isObject(value: unknown): value is Schema {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function props(schema: Schema): Record<string, Schema> {
  return (isObject(schema.properties) ? schema.properties : {}) as Record<string, Schema>;
}

/** `exactOptionalPropertyTypes` keeps `label: undefined` apart from no label. */
function omitUndefined<T extends object>(value: { [K in keyof T]-?: T[K] | undefined }): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}
