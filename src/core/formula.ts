// Formula tree operations (ported from salariez's formula-tree.ts). A formula is pyformula's JSON
// plus pyruleset's `when` node: a number, a variable's name, an operation of terms, a function of
// one value, or a ruleset. Every operation returns a new tree that is still a valid formula.
import { emptyRuleset } from "./ruleset.ts";
import { at, type Json, type Path, setAt } from "./tree.ts";

export type Operation = { operator: string; expressions: Formula[] };
export type Rounded = { round: Formula; ndigits: number };
export type Applied = { [name: string]: Formula };
export type When = { when: { branches: Json[]; otherwise: Formula } };
export type Formula = number | string | Operation | Rounded | Applied | When;
export type Kind = "number" | "variable" | "operation" | "function" | "when";

/** A new `round`'s decimal places. */
export const ROUND_PLACES = 2;

export function kindOf(node: Formula): Kind {
  if (typeof node === "number") return "number";

  if (typeof node === "string") return "variable";

  if ("operator" in node) return "operation";

  if ("when" in node) return "when";

  return "function";
}

/** A function node's name (`round`, `floor`, …): its key other than `ndigits`; null otherwise. */
export function functionOf(node: Formula): string | null {
  if (kindOf(node) !== "function") return null;

  return Object.keys(node).find((key) => key !== "ndigits") ?? null;
}

/** `node` as another kind, keeping it as the first term, the function's value or the otherwise. */
export function convert(node: Formula, kind: Kind, variable: string, fn = "round"): Formula {
  if (kind === kindOf(node)) return node;

  switch (kind) {
    case "number":
      return 0;
    case "variable":
      return variable;
    case "operation":
      return { operator: "add", expressions: [node, 0] };
    case "function":
      return apply(node, fn);
    case "when":
      return { when: { ...emptyRuleset(), otherwise: node } };
  }
}

/** `node` as the value of function `fn` (`round` gets its places). */
export function apply(node: Formula, fn: string): Formula {
  return fn === "round" ? { round: node, ndigits: ROUND_PLACES } : { [fn]: node };
}

/** A function node as another function, its value kept. */
export function setFunction(node: Formula, fn: string): Formula {
  const name = functionOf(node);

  if (!name) return node;

  const value = (node as Applied)[name] as Formula;

  if (fn === "round" && name === "round") return node;

  return apply(value, fn);
}

/** `node` as the first term of a new operation (the palette's operator piece). */
export function operate(node: Formula, operator: string): Formula {
  return { operator, expressions: [node, 0] };
}

export function addTerm(tree: Json, path: Path): Json {
  const node = at(tree, path) as Operation;

  return setAt(tree, [...path, "expressions"], [...node.expressions, 0] as Json);
}

/** Unchanged when the operation would keep fewer than two terms. */
export function removeTerm(tree: Json, path: Path, index: number): Json {
  const node = at(tree, path) as Operation;

  if (node.expressions.length <= 2) return tree;

  return setAt(
    tree,
    [...path, "expressions"],
    node.expressions.filter((_, i) => i !== index) as Json,
  );
}
