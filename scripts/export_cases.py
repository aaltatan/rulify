"""Export the golden cases the editor is checked against to `src/core/cases.json`.

Run with `pnpm sync`, which uses the sibling library repos, after changing them. Each case
is a definition with the schema it was built from, what Python prints for it once
compiled, and the same rule as Python code. The code is checked here: it is run, and it
must give the same result as the compiled definition on every sample employee.
"""

import json
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Annotated, Any, Literal

from pyformula import Formula, FormulaCompiler, VariablesRegistry, get_formula_json_schema
from pyformula import math as formula_math
from pyruleset import (
    Ruleset,
    RulesetCompiler,
    WhenCompiler,
    describe,
    get_ruleset_json_schema,
    get_when_json_schema,
    otherwise,
    when,
)
from pyspecification import (
    ExpressionWrapperDict,
    ObjectRulesRegistry,
    Predicate,
    PredicateCompiler,
    get_expression_json_schema,
)
from pyvocabulary import Choices, Label

OUTPUT = Path(__file__).resolve().parents[1] / "src" / "core" / "cases.json"

type Kind = Literal["predicate", "formula", "ruleset"]

# -----------------------
# the sample: payroll
# -----------------------

Grade = Annotated[
    str,
    Choices(
        {
            "a": {"en": "First", "ar": "الأولى"},
            "b": {"en": "Second", "ar": "الثانية"},
            "c": {"en": "Third", "ar": "الثالثة"},
        }
    ),
]


@dataclass(frozen=True, slots=True)
class Employee:
    salary: float
    years: int
    grade: str
    children: int
    married: bool


EMPLOYEES = [
    Employee(1200.0, 12, "a", 3, married=True),
    Employee(800.0, 2, "b", 0, married=False),
    Employee(950.0, 6, "c", 1, married=True),
    Employee(1500.0, 25, "a", 0, married=False),
]

rules = ObjectRulesRegistry[Employee, bool]("logical")
variables = VariablesRegistry[Employee]()


@rules.rule(label={"en": "Years of service at least", "ar": "سنوات الخدمة لا تقل عن"})
def years__ge(
    employee: Employee,
    minimum: Annotated[int, Label({"en": "Years", "ar": "السنوات"})],
) -> bool:
    return employee.years >= minimum


@rules.rule(label={"en": "Grade is", "ar": "الفئة هي"})
def grade__eq(employee: Employee, value: Grade) -> bool:
    return employee.grade == value


@rules.rule(label={"en": "Children at least", "ar": "عدد الأولاد لا يقل عن"})
def children__ge(employee: Employee, count: int) -> bool:
    return employee.children >= count


@rules.rule(label={"en": "Is married", "ar": "متزوج"})
def is_married(employee: Employee) -> bool:
    return employee.married


@variables.variable(label={"en": "Salary", "ar": "الراتب"})
def salary(employee: Employee) -> float:
    """Return the monthly base salary."""
    return employee.salary


@variables.variable(label={"en": "Years of service", "ar": "سنوات الخدمة"})
def years(employee: Employee) -> float:
    return employee.years


@variables.variable(label={"en": "Children", "ar": "عدد الأولاد"})
def children(employee: Employee) -> float:
    return employee.children


# -----------------------
# compilers and schemas
# -----------------------


def start(wrapper: ExpressionWrapperDict) -> Predicate[Employee, bool]:
    """Return the neutral start of a group: true for `all`, false for `any` (as salariez)."""
    is_all = wrapper["operator"] == "all"

    return Predicate(lambda _: is_all, operator="logical", name="true" if is_all else "false")


PREDICATES = PredicateCompiler[Employee, bool](rules.rules, start)
FORMULAS = WhenCompiler(
    PREDICATES,
    lambda names: FormulaCompiler({**variables.variables, **names}),
    wrap=Formula,
)
RULESETS = RulesetCompiler(PREDICATES, FORMULAS)
COMPILERS: dict[Kind, Callable[[Any], Callable[[Employee], Any]]] = {
    "predicate": PREDICATES.compile,
    "formula": FORMULAS.compile,
    "ruleset": RULESETS.compile,
}

PREDICATE_SCHEMA = get_expression_json_schema(rules.rules, labels=rules.labels)
FORMULA_SCHEMA = get_formula_json_schema(
    variables.variables,
    labels=variables.labels,
    nodes=[get_when_json_schema(PREDICATE_SCHEMA)],
)
SCHEMAS: dict[str, dict[str, Any]] = {
    "payroll-predicate": PREDICATE_SCHEMA,
    "payroll-formula": FORMULA_SCHEMA,
    "payroll-ruleset": get_ruleset_json_schema(PREDICATE_SCHEMA, FORMULA_SCHEMA),
}
SCHEMA_OF: dict[Kind, str] = {
    "predicate": "payroll-predicate",
    "formula": "payroll-formula",
    "ruleset": "payroll-ruleset",
}

# -----------------------
# the cases
# -----------------------


def call(name: str, *args: Any, inverse: bool = False, **kwargs: Any) -> dict[str, Any]:
    return {"name": name, "args": list(args), "kwargs": kwargs, "inverse": inverse}


def group(operator: str, *expressions: Any) -> dict[str, Any]:
    return {"operator": operator, "expressions": list(expressions)}


def op(operator: str, *expressions: Any) -> dict[str, Any]:
    return {"operator": operator, "expressions": list(expressions)}


def ruleset(*branches: dict[str, Any], fallback: Any) -> dict[str, Any]:
    return {"branches": list(branches), "otherwise": fallback}


def branch(condition: Any, value: Any, label: str | None = None) -> dict[str, Any]:
    return {"when": condition, "then": value, **({"label": label} if label else {})}


SENIOR = call("years__ge", 10)
GRADE_A = call("grade__eq", "a")
FAMILY = group("all", call("is_married"), call("children__ge", count=2))
FAMILY_BONUS = {
    "when": ruleset(branch(FAMILY, op("multiply", "children", 25), "family"), fallback=0)
}

CASES: list[tuple[str, Kind, Any]] = [
    ("one rule", "predicate", SENIOR),
    ("a rule with a keyword argument", "predicate", call("children__ge", count=2)),
    ("a negated rule", "predicate", call("is_married", inverse=True)),
    ("all of", "predicate", group("all", SENIOR, GRADE_A)),
    (
        "nested groups",
        "predicate",
        group("any", FAMILY, group("all", GRADE_A, call("years__ge", 20, inverse=True))),
    ),
    ("a number", "formula", 1000),
    ("a decimal number", "formula", 0.075),
    ("a variable", "formula", "salary"),
    ("an operation", "formula", op("multiply", "salary", 0.05)),
    ("a chain", "formula", op("add", "salary", 100, op("multiply", "children", 50))),
    ("a power chain", "formula", op("power", "years", 2, 0.5)),
    ("a number first", "formula", op("subtract", 2000, "salary")),
    ("round", "formula", {"round": op("multiply", "salary", 0.075), "ndigits": 2}),
    ("functions", "formula", {"floor": {"sqrt": "years"}}),
    ("negative and absolute", "formula", {"negative": {"absolute": op("subtract", "years", 10)}}),
    ("a ruleset inside a formula", "formula", op("add", "salary", FAMILY_BONUS)),
    (
        "a ruleset",
        "ruleset",
        ruleset(
            branch(group("all", SENIOR, GRADE_A), op("multiply", "salary", 0.2), "senior grade a"),
            branch(SENIOR, op("multiply", "salary", 0.1), "senior"),
            fallback=op("multiply", "salary", 0.05),
        ),
    ),
    ("an unlabelled branch", "ruleset", ruleset(branch(GRADE_A, 150), fallback=0)),
    ("only otherwise", "ruleset", ruleset(fallback="salary")),
    (
        "a ruleset inside a branch",
        "ruleset",
        ruleset(
            branch(SENIOR, op("add", 100, FAMILY_BONUS), "senior"),
            fallback=FAMILY_BONUS,
        ),
    ),
]

# -----------------------
# python code
# -----------------------

PRECEDENCE = {"add": 1, "subtract": 1, "multiply": 2, "divide": 2, "modulo": 2, "floor_divide": 2}
SYMBOLS = {
    "add": "+",
    "subtract": "-",
    "multiply": "*",
    "divide": "/",
    "modulo": "%",
    "floor_divide": "//",
    "power": "**",
}
UNARY = {"positive": "+", "negative": "-"}


def python_code(kind: Kind, definition: Any) -> str:
    """Return the definition as Python, the rules and variables in scope by their names."""
    imports: set[tuple[str, str]] = set()
    match kind:
        case "predicate":
            body = predicate_code(definition)
        case "formula":
            body = formula_code(definition, imports, callable_number=False)
        case "ruleset":
            body = ruleset_code(definition, imports, multiline=True)

    lines = [
        f"from {module} import {', '.join(sorted(n for m, n in imports if m == module))}"
        for module in sorted({module for module, _ in imports})
    ]

    return "\n".join([*lines, *([""] if lines else []), f"rule = {body}", ""])


def predicate_code(expression: Mapping[str, Any]) -> str:
    if "operator" in expression:
        joiner = " & " if expression["operator"] == "all" else " | "
        parts = [
            f"({predicate_code(item)})"
            if "operator" in item and len(item["expressions"]) > 1
            else predicate_code(item)
            for item in expression["expressions"]
        ]

        return joiner.join(parts)

    arguments = [*map(repr, expression["args"])]
    arguments += [f"{key}={value!r}" for key, value in expression["kwargs"].items()]
    code = f"{expression['name']}({', '.join(arguments)})"

    return f"~{code}" if expression["inverse"] else code


def formula_code(node: Any, imports: set[tuple[str, str]], *, callable_number: bool) -> str:
    if isinstance(node, int | float) and not isinstance(node, bool):
        # a bare number is not callable, where a value must be called it becomes a lambda
        return f"lambda _: {node!r}" if callable_number else repr(node)

    if isinstance(node, str):
        return node

    if "when" in node:
        imports.add(("pyformula", "Formula"))
        compiled = RULESETS.compile(node["when"])

        return f"Formula({ruleset_code(node['when'], imports)}, name={describe(compiled)!r})"

    if "operator" in node:
        operator = node["operator"]
        parts = [operand_code(item, operator, imports) for item in node["expressions"]]
        code = parts[0]

        for part in parts[1:]:
            # `**` is right-associative in Python, so a power chain keeps its left side
            code = f"({code})" if operator == "power" and code != parts[0] else code
            code = f"{code} {SYMBOLS[operator]} {part}"

        return code

    if "round" in node:
        rounded = formula_code(node["round"], imports, callable_number=False)

        return f"round({rounded}, {node['ndigits']})"

    ((name, operand),) = node.items()
    inner = formula_code(operand, imports, callable_number=False)

    if name in UNARY:
        return (
            f"{UNARY[name]}({inner})"
            if isinstance(operand, dict) and "operator" in operand
            else f"{UNARY[name]}{inner}"
        )

    if name == "absolute":
        return f"abs({inner})"

    imports.add(("pyformula.math", name))

    return f"{name}({inner})"


def operand_code(node: Any, operator: str, imports: set[tuple[str, str]]) -> str:
    code = formula_code(node, imports, callable_number=False)
    nested = isinstance(node, dict) and "operator" in node

    if nested and PRECEDENCE.get(node["operator"], 3) <= PRECEDENCE.get(operator, 3):
        return f"({code})"

    if isinstance(node, int | float) and node < 0:
        return f"({code})"

    return code


def ruleset_code(
    definition: Mapping[str, Any], imports: set[tuple[str, str]], *, multiline: bool = False
) -> str:
    def value(node: Any) -> str:
        return formula_code(node, imports, callable_number=True)

    fallback = value(definition["otherwise"])

    if not definition.get("branches"):
        imports.add(("pyruleset", "Ruleset"))

        return f"Ruleset((), {fallback})"

    imports.update({("pyruleset", "when"), ("pyruleset", "otherwise")})
    parts = []

    for item in definition["branches"]:
        label = f", label={item['label']!r}" if "label" in item else ""
        parts.append(f"when({predicate_code(item['when'])}, {value(item['then'])}{label})")

    parts.append(f"otherwise({fallback})")

    if multiline:
        return "(\n    " + "\n    | ".join(parts) + "\n)"

    return f"({' | '.join(parts)})"


# -----------------------
# export
# -----------------------


def checked(kind: Kind, definition: Any, code: str) -> str:
    """Return what Python prints for the compiled definition, after checking `code` agrees."""
    compiled = COMPILERS[kind](definition)
    namespace: dict[str, Any] = {
        **rules.rules,
        **variables.variables,
        "Formula": Formula,
        "Ruleset": Ruleset,
        "when": when,
        "otherwise": otherwise,
        **{name: getattr(formula_math, name) for name in dir(formula_math)},
    }
    exec(code, namespace)  # noqa: S102
    rule = namespace["rule"]

    for employee in EMPLOYEES:
        expected = compiled(employee)
        actual = rule(employee) if callable(rule) else rule

        if actual != expected:
            msg = f"{code}\ngives {actual!r} for {employee}, the definition gives {expected!r}"
            raise AssertionError(msg)

    return repr(compiled) if kind == "ruleset" else str(compiled)


def main() -> None:
    cases = []

    for name, kind, definition in CASES:
        code = python_code(kind, definition)
        cases.append(
            {
                "name": name,
                "kind": kind,
                "schema": SCHEMA_OF[kind],
                "definition": definition,
                "prints": checked(kind, definition, code),
                "python": code,
            }
        )

    output = {"schemas": SCHEMAS, "cases": cases}
    OUTPUT.write_text(f"{json.dumps(output, indent=2, ensure_ascii=False)}\n", encoding="utf-8")
    print(f"Saved {len(cases)} cases to: {OUTPUT}")


if __name__ == "__main__":
    main()
