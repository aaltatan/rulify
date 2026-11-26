// The "Reads as" line: what Python prints for a compiled definition, character for character
// (`str(predicate)`, `str(formula)`, `repr(ruleset)`), checked against cases.json.
import {
  type Formula,
  functionOf,
  kindOf,
  type Operation,
  type Rounded,
  type When,
} from "./formula.ts";
import { isGroup, type Predicate } from "./predicate.ts";
import type { Kind } from "./reader.ts";
import type { Branch, Ruleset } from "./ruleset.ts";
import type { Json } from "./tree.ts";

/** pyformula's operator symbols (`OPERATORS` in `pyformula.operator`). */
export const SYMBOLS: Readonly<Record<string, string>> = {
  add: "+",
  subtract: "-",
  multiply: "*",
  divide: "/",
  modulo: "%",
  floor_divide: "//",
  power: "**",
};

const UNARY: Readonly<Record<string, (inner: string) => string>> = {
  positive: (inner) => `+${inner}`,
  negative: (inner) => `-${inner}`,
  absolute: (inner) => `|${inner}|`,
};

export function describe(kind: Kind, definition: Json): string {
  switch (kind) {
    case "predicate":
      return describePredicate(definition as Predicate);
    case "formula":
      return describeFormula(definition as Formula);
    case "ruleset": {
      const { branches } = definition as Ruleset;

      return `Ruleset(${[...branches.map(branchName), "otherwise"].join(" | ")})`;
    }
  }
}

/**
 * A rule's name (`NOT` when inverse); a group folds from its start predicate, as rulify's
 * compiler does: `true` for `all`, `false` for `any`.
 */
export function describePredicate(node: Predicate): string {
  if (!isGroup(node)) return node.inverse ? `NOT ${node.name}` : node.name;

  const joiner = node.operator === "all" ? "AND" : "OR";
  const start = node.operator === "all" ? "true" : "false";

  return node.expressions.reduce(
    (acc, item) => `(${acc} ${joiner} ${describePredicate(item)})`,
    start,
  );
}

export function describeFormula(node: Formula): string {
  switch (kindOf(node)) {
    case "number":
      // shortcut: JS prints 1e21 and 1e-7 unlike Python, and 5.0 as 5; fine for typed amounts
      return String(node);
    case "variable":
      return node as string;
    case "operation": {
      const { operator, expressions } = node as Operation;
      const [first, ...rest] = expressions.map(describeFormula);

      return rest.reduce(
        (acc, term) => `(${acc} ${SYMBOLS[operator] ?? operator} ${term})`,
        first ?? "",
      );
    }
    case "function": {
      const name = functionOf(node) as string;
      const inner = describeFormula((node as Record<string, Formula>)[name] as Formula);

      if (name === "round") return `round(${inner}, ${(node as Rounded).ndigits})`;

      return UNARY[name]?.(inner) ?? `${name}(${inner})`;
    }
    case "when":
      return describeWhen((node as When).when as Ruleset);
  }
}

/** pyruleset's `describe`: each branch with the value it gives. */
export function describeWhen(ruleset: Ruleset): string {
  const branches = ruleset.branches.map(
    (branch) => `${branchName(branch)} -> ${describeFormula(branch.then as Formula)}`,
  );

  return `when(${[...branches, `otherwise -> ${describeFormula(ruleset.otherwise as Formula)}`].join(" | ")})`;
}

/** A branch prints as its label, or its condition when the label is missing or empty. */
function branchName(branch: Branch): string {
  return branch.label || describePredicate(branch.when as Predicate);
}
