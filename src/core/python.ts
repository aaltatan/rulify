// The definition as Python code: a mirror of `python_code` in scripts/export_cases.py, which
// runs every snippet against the compiled definition. Rules and variables are in scope by name.
import { describeWhen, SYMBOLS } from "./describe.ts";
import type { Formula, Operation, Rounded, When } from "./formula.ts";
import { functionOf, kindOf } from "./formula.ts";
import { isGroup, type Predicate } from "./predicate.ts";
import type { Kind } from "./reader.ts";
import type { Ruleset } from "./ruleset.ts";
import type { Json } from "./tree.ts";

type Imports = Set<string>; // "module name" pairs, joined by a space

const PRECEDENCE: Readonly<Record<string, number>> = {
  add: 1,
  subtract: 1,
  multiply: 2,
  divide: 2,
  modulo: 2,
  floor_divide: 2,
};
const UNARY: Readonly<Record<string, string>> = { positive: "+", negative: "-" };

export function python(kind: Kind, definition: Json): string {
  const imports: Imports = new Set();
  const body =
    kind === "predicate"
      ? predicateCode(definition as Predicate)
      : kind === "formula"
        ? formulaCode(definition as Formula, imports, false)
        : rulesetCode(definition as Ruleset, imports, true);
  const modules = [...new Set([...imports].map((pair) => pair.split(" ")[0] as string))].sort();
  const lines = modules.map((module) => {
    const names = [...imports]
      .filter((pair) => pair.startsWith(`${module} `))
      .map((pair) => pair.slice(module.length + 1))
      .sort();

    return `from ${module} import ${names.join(", ")}`;
  });

  return [...lines, ...(lines.length ? [""] : []), `rule = ${body}`, ""].join("\n");
}

function predicateCode(node: Predicate): string {
  if (isGroup(node)) {
    const joiner = node.operator === "all" ? " & " : " | ";

    return node.expressions
      .map((item) =>
        isGroup(item) && item.expressions.length > 1
          ? `(${predicateCode(item)})`
          : predicateCode(item),
      )
      .join(joiner);
  }

  const args = [
    ...node.args.map(pyRepr),
    ...Object.entries(node.kwargs).map(([key, value]) => `${key}=${pyRepr(value)}`),
  ];
  const code = `${node.name}(${args.join(", ")})`;

  return node.inverse ? `~${code}` : code;
}

function formulaCode(node: Formula, imports: Imports, callableNumber: boolean): string {
  switch (kindOf(node)) {
    case "number":
      // a bare number is not callable: where a value is called, it becomes a lambda
      return callableNumber ? `lambda _: ${pyRepr(node as number)}` : pyRepr(node as number);
    case "variable":
      return node as string;
    case "when": {
      imports.add("pyformula Formula");
      const ruleset = (node as When).when as Ruleset;

      return `Formula(${rulesetCode(ruleset, imports, false)}, name=${pyRepr(describeWhen(ruleset))})`;
    }
    case "operation": {
      const { operator, expressions } = node as Operation;
      const parts = expressions.map((item) => operandCode(item, operator, imports));
      const first = parts[0] ?? "";
      let code = first;

      for (const part of parts.slice(1)) {
        // `**` is right-associative in Python, so a power chain keeps its left side
        code = operator === "power" && code !== first ? `(${code})` : code;
        code = `${code} ${SYMBOLS[operator] ?? operator} ${part}`;
      }

      return code;
    }
    case "function": {
      const name = functionOf(node) as string;
      const operand = (node as Record<string, Formula>)[name] as Formula;
      const inner = formulaCode(operand, imports, false);

      if (name === "round") return `round(${inner}, ${(node as Rounded).ndigits})`;

      if (name in UNARY)
        return kindOf(operand) === "operation"
          ? `${UNARY[name]}(${inner})`
          : `${UNARY[name]}${inner}`;

      if (name === "absolute") return `abs(${inner})`;

      imports.add(`pyformula.math ${name}`);

      return `${name}(${inner})`;
    }
  }
}

function operandCode(node: Formula, operator: string, imports: Imports): string {
  const code = formulaCode(node, imports, false);

  if (
    kindOf(node) === "operation" &&
    (PRECEDENCE[(node as Operation).operator] ?? 3) <= (PRECEDENCE[operator] ?? 3)
  ) {
    return `(${code})`;
  }

  if (typeof node === "number" && node < 0) return `(${code})`;

  return code;
}

function rulesetCode(ruleset: Ruleset, imports: Imports, multiline: boolean): string {
  const value = (node: Json) => formulaCode(node as Formula, imports, true);
  const fallback = value(ruleset.otherwise);

  if (!ruleset.branches?.length) {
    imports.add("pyruleset Ruleset");

    return `Ruleset((), ${fallback})`;
  }

  imports.add("pyruleset when");
  imports.add("pyruleset otherwise");
  const parts = ruleset.branches.map((branch) => {
    const label = "label" in branch ? `, label=${pyRepr(branch.label as string)}` : "";

    return `when(${predicateCode(branch.when as Predicate)}, ${value(branch.then)}${label})`;
  });
  parts.push(`otherwise(${fallback})`);

  return multiline ? `(\n    ${parts.join("\n    | ")}\n)` : `(${parts.join(" | ")})`;
}

/** Python's `repr` of a JSON value: `'gold'`, `True`, `None`, `[1, 2]`, `{'a': 1}`. */
export function pyRepr(value: Json): string {
  if (value === null) return "None";

  if (typeof value === "boolean") return value ? "True" : "False";

  if (typeof value === "number") return String(value);

  if (typeof value === "string") return pyString(value);

  if (Array.isArray(value)) return `[${value.map(pyRepr).join(", ")}]`;

  return `{${Object.entries(value)
    .map(([key, item]) => `${pyString(key)}: ${pyRepr(item)}`)
    .join(", ")}}`;
}

function pyString(text: string): string {
  // Python quotes with ' unless the text has a ' and no "
  const quote = text.includes("'") && !text.includes('"') ? '"' : "'";
  const escaped = [...text]
    .map((char) => {
      if (char === "\\" || char === quote) return `\\${char}`;

      if (char === "\n") return "\\n";

      if (char === "\r") return "\\r";

      if (char === "\t") return "\\t";

      const code = char.codePointAt(0) as number;

      return code < 0x20 || code === 0x7f ? `\\x${code.toString(16).padStart(2, "0")}` : char;
    })
    .join("");

  return `${quote}${escaped}${quote}`;
}
