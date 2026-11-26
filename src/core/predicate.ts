// Predicate tree operations (ported from salariez's query-tree.ts). A predicate is
// pyspecification's JSON: a rule call `{name, args, kwargs, inverse}` (every key present) or a
// group `{operator: "all" | "any", expressions}`. Paths are JSON paths, like errors.
import type { RuleInfo } from "./reader.ts";
import { at, type Json, type Path, setAt } from "./tree.ts";

export type Call = { name: string; args: Json[]; kwargs: Record<string, Json>; inverse: boolean };
export type Group = { operator: "all" | "any"; expressions: Predicate[] };
export type Predicate = Call | Group;

export const isGroup = (node: Predicate): node is Group => "expressions" in node;

export function emptyGroup(): Group {
  return { operator: "all", expressions: [] };
}

/** A new call of `rule`, each required argument set to its default, first choice or a zero. */
export function newCall(rule: RuleInfo): Call {
  const kwargs: Record<string, Json> = {};

  for (const param of rule.kwargs) {
    if (param.required) kwargs[param.name] = param.initial;
  }

  return {
    name: rule.name,
    args: rule.args.filter((param) => param.required).map((param) => param.initial),
    kwargs,
    inverse: false,
  };
}

/** The tree with `node` appended to the group at `path`. */
export function addNode(tree: Json, path: Path, node: Predicate): Json {
  const group = at(tree, path) as Group;

  return setAt(tree, [...path, "expressions"], [...group.expressions, node] as Json);
}

/** The tree without the node at `path` (`[..., "expressions", i]`); the root becomes empty. */
export function removeNode(tree: Json, path: Path): Json {
  if (path.length === 0) return emptyGroup() as Json;

  const parent = path.slice(0, -2);
  const index = path[path.length - 1];
  const group = at(tree, parent) as Group;

  return setAt(
    tree,
    [...parent, "expressions"],
    group.expressions.filter((_, i) => i !== index) as Json,
  );
}

/** The node at `path` moved by `step` places inside its group; unchanged out of range. */
export function moveNode(tree: Json, path: Path, step: number): Json {
  const parent = path.slice(0, -2);
  const from = path[path.length - 1] as number;
  const expressions = [...(at(tree, parent) as Group).expressions];
  const to = from + step;

  if (to < 0 || to >= expressions.length) return tree;

  [expressions[from], expressions[to]] = [
    expressions[to] as Predicate,
    expressions[from] as Predicate,
  ];

  return setAt(tree, [...parent, "expressions"], expressions as Json);
}

export function setOperator(tree: Json, path: Path, operator: Group["operator"]): Json {
  return setAt(tree, [...path, "operator"], operator);
}

export function toggleInverse(tree: Json, path: Path): Json {
  return setAt(tree, [...path, "inverse"], !(at(tree, path) as Call).inverse);
}

/** `"employee__age__ge"` -> `{field: "employee__age", operator: "ge"}`, as `x-field` splits it. */
export function splitName(name: string): { field: string; operator: string } {
  const index = name.lastIndexOf("__");

  return index <= 0
    ? { field: name, operator: "" }
    : { field: name.slice(0, index), operator: name.slice(index + 2) };
}
