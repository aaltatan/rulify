# rulify

Build business rules in the browser: [pyruleset](https://github.com/aaltatan/pyruleset)
rulesets, [pyspecification](https://github.com/aaltatan/pyspecification) predicates and
[pyformula](https://github.com/aaltatan/pyformula) formulas, drawn from a JSON Schema exported
by those libraries. Frontend only, no backend: the schema and the rules never leave the browser.

- Live: [rulify.surge.sh](https://rulify.surge.sh)
- Source: [github.com/aaltatan/rulify](https://github.com/aaltatan/rulify)

## Export a schema from Python

Register your rules and variables as usual, with labels if you want them shown in Arabic or
English, then export one schema for the three kinds:

```python
import json

from pyformula import get_formula_json_schema
from pyruleset import get_ruleset_json_schema, get_when_json_schema
from pyspecification import get_expression_json_schema

# rules: an ObjectRulesRegistry, variables: a VariablesRegistry
predicates = get_expression_json_schema(rules.rules, labels=rules.labels)
formulas = get_formula_json_schema(
    variables.variables, labels=variables.labels, nodes=[get_when_json_schema(predicates)]
)
schema = get_ruleset_json_schema(predicates, formulas)

with open("schema.json", "w", encoding="utf-8") as file:
    json.dump(schema, file, ensure_ascii=False, indent=2)
```

Drop `schema.json` on rulify. A schema of a predicate alone (`predicates`) or a formula alone
(`formulas`) works too; rulify offers what the schema holds. Or press "Try the payroll sample".

## Build a rule

Choose what to build: a **ruleset** (cases tried in order, then "otherwise"), a **condition**
(rule calls in "all of" / "any of" groups), or a **value** (numbers, variables, operations,
functions, and values that depend on a condition). Then draw it in one of four looks, all over
the same definition:

- **Rail**: numbered cases down the side, each "if" its condition "then" its value. Choose a
  value, then press a piece in the palette (a variable, an operation, a function, "by
  condition") to put it there.
- **Sentence**: the same rule as sentences, "If … then …, else if …, otherwise …".
- **Tree**: a decision tree; press a node to edit it.
- **Code**: the definition JSON, taken only once it is valid.

Every part is checked against the schema as you build (Ajv, Draft 2020-12), and a problem sits
on the part that caused it. "Reads as" shows what Python prints for the rule.

Your work is saved in this browser as you go and opens again on your next visit.

## The output

The blueprint beside the sheet prints the definition:

- **JSON**, which the Python compilers accept as-is. Copy it, or download `ruleset.json`
  (`predicate.json`, `formula.json`), then compile it with `RulesetCompiler`,
  `PredicateCompiler` or pyruleset's `WhenCompiler`.
- **Python**, the same rule written as code with the libraries (`when(...) | otherwise(...)`,
  `years__ge(10) & grade__eq('a')`, `round(salary * 0.05, 2)`). Copy it or download it.

## Run

```bash
pnpm install
pnpm dev
```

## Develop

```bash
pnpm check   # typecheck, Biome, Vitest
pnpm build
```

`src/core/cases.json` is generated from the Python libraries, never edited by hand. After
changing them, refresh it and check both agree:

```bash
pnpm sync && pnpm check
```

`pnpm sync` needs [uv](https://docs.astral.sh/uv/) and the library repositories checked out
beside this one (`../../python-packages/pyvocabulary`, `pyspecification`, `pyformula`,
`pyruleset`). It runs `scripts/export_cases.py`, which also runs each case's Python code and
fails if it disagrees with the compiled definition.
