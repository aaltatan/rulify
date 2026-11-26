# CLAUDE.md — rulify

A React + Tailwind + TypeScript editor for business rules: pyruleset rulesets, pyspecification
predicates and pyformula formulas, built visually from a JSON Schema the user uploads. Frontend
only, no backend. The output is definition JSON that the Python compilers accept as-is.

Read `PRODUCT.md` for the why, `PHASES.md` for what to do next. Work one phase at a time and tick
its boxes as they land.

## Linked projects

The Python libraries are the source of truth. They live beside this repo:

| Library | Path (from this repo) | What rulify reads from it |
| --- | --- | --- |
| pyruleset | `../../python-packages/pyruleset` | `get_ruleset_json_schema`, the `when` formula node |
| pyspecification | `../../python-packages/pyspecification` | `get_expression_json_schema(rules)` |
| pyformula | `../../python-packages/pyformula` | `get_formula_json_schema(...)` (added in Phase 0) |
| pyvocabulary | `../../python-packages/pyvocabulary` | the shared x- keyword helpers (added in Phase 0) |

- **A feature that needs schema information is added to Python first** (the library function
  and its pytest test), then mirrored here (the TypeScript and its Vitest test). Never invent an
  x- keyword or a node shape in TypeScript only.
- `src/core/cases.json` is generated from Python with `pnpm sync`, never edited by hand: sample
  schemas and definitions, each with what Python prints for it (`str(formula)`,
  `repr(ruleset)`, the predicate's name) and its Python code. `src/core/cases.test.ts` checks the
  TypeScript output equals it, case for case.
- Run `pnpm sync && pnpm check` after any change in the libraries. `pnpm sync` runs
  `scripts/export_cases.py` against the sibling repos (editable installs), not PyPI.
- How the cases are made (`scripts/export_cases.py` is the reference `python.ts` mirrors):
  - `{"schemas": {name: schema}, "cases": [{name, kind, schema, definition, prints, python}]}`.
  - Predicates compile with salariez's group start (`true` for `all`, `false` for `any`), so a
    group prints as `((true AND years__ge) AND grade__eq)`.
  - `python` is `rule = <expression>` after its imports; rules and variables are in scope by
    their registered names. Groups are `&` / `|` with nested groups in parentheses, `~` for
    inverse; operations nest with Python precedence (`(a ** b) ** c` for power chains);
    `round(x, n)`, `abs(x)`, `-x`, `floor(x)` from `pyformula.math`. Where a value must be
    callable (a ruleset's `then` / `otherwise`) a bare number becomes `lambda _: 0`; a ruleset
    with no branches is `Ruleset((), value)`; a `when` node is
    `Formula(<ruleset>, name="<what Python prints for it>")`.
  - `export_cases.py` runs every snippet and checks it gives the compiled definition's result
    on every sample employee; a wrong snippet fails `pnpm sync`.
- Ajv: `new Ajv2020({ strictTuples: false })` (argument schemas use `prefixItems` with
  `items: false`, which strict tuples warns about) and `addVocabulary` for the x- keywords.
  Embedded sub-schemas carry their root `$ref` in `allOf` (pyruleset 0.2.1); Ajv overflows on a
  bare root `$ref` in an embedded resource.

### salariez: reference only

`../../../inprogress/salariez` (`frontend/src/features/expression-builder/`, `frontend/src/features/query-builder/`,
`frontend/src/lib/formula-tree.ts`, `frontend/src/lib/query-tree.ts`) has the builder rulify grows
from: the rail + palette, sentence and tree looks, the tree operations, `describe.ts`. Read it,
borrow ideas and code, but rulify never imports from it and salariez never imports from rulify.
Differences on purpose:

- salariez reads a hand-built `expression_schema()` from its API; rulify reads a JSON Schema file.
- salariez checks on the server (`POST check/`); rulify validates in the browser with Ajv.
- salariez uses i18next and react-aria; rulify keeps schemify's minimal dependencies.

## The definitions rulify edits

```jsonc
// predicate (pyspecification): a rule call, or an all/any group of expressions
{"name": "age__ge", "args": [18], "kwargs": {}, "inverse": false}
{"operator": "all", "expressions": [ /* predicates or groups */ ]}

// formula (pyformula): a number, a variable name, an operation, or a function of one value
0.05
"amount"
{"operator": "multiply", "expressions": ["amount", 0.05]}
{"round": "amount", "ndigits": 2}
{"floor": "amount"}

// ruleset (pyruleset): first matching branch decides
{"branches": [{"when": <predicate>, "then": <formula>, "label": "gold 20%"}], "otherwise": <formula>}

// nested ruleset inside a formula (pyruleset, Phase 0)
{"when": <ruleset>}
```

The root of a document is one of: ruleset, predicate, formula. A formula may hold `when` nodes.

## x- keywords (final, Phase 0)

Emitted by the libraries, read by `src/core/reader.ts`. A text (`x-label`, `x-description`,
a choice's `label`) is a string for every language or a `{"ar": "...", "en": "..."}` map
(pyvocabulary's `Text`).

| Keyword | On | Emitted by | Meaning |
| --- | --- | --- | --- |
| `x-kind` | the predicate root, the formula root, the ruleset root, and the ruleset inside each `when` node | `get_expression_json_schema`, `get_formula_json_schema`, `get_ruleset_json_schema`, `get_when_json_schema` | `"predicate"`, `"formula"`, `"ruleset"`: which editor draws it |
| `x-label` | a rule's call schema; a variable's `{"const": name}` in `$defs.variable.oneOf`; an argument schema | `registry.rule(label=)` / `registry.variable(label=)` passed as `labels=registry.labels`; `Annotated[T, Label(...)]` | shown instead of the name |
| `x-description` | an argument schema | `Annotated[T, Label(..., description=...)]` | help text; rules and variables carry the plain `description` (their docstring) instead |
| `x-field`, `x-operator` | a rule's call schema whose name has `__` | `get_rule_json_schema` | the split at the last `__` (`age__ge` → `age`, `ge`; `employee__age__ge` → `employee__age`, `ge`) |
| `x-choices` | an argument schema, next to its `enum` | `Annotated[T, Choices({value: label})]` | `[{"value": ..., "label": <text>}]`, written inline (no lookups) |

Not labelled by the libraries: the group operators (`all`, `any`), the formula operators
(`add` …) and functions (`floor` …). rulify labels those in `i18n.ts`.

Unknown x- keywords are ignored; a missing `x-label` falls back to the name. Ajv's strict
mode throws on unknown keywords, so `validate.ts` registers these five with
`ajv.addVocabulary([...])`.

Shapes rulify relies on:

- Formula: root `{"$ref": "#/$defs/formula"}`; `$defs.formula.oneOf` holds `{"type":
  "number"}`, `{"$ref": "#/$defs/variable"}` (only when there are variables), the operation
  (`operator` enum), one object per function (`round` also requires `ndigits`), then extra
  nodes such as `when`. Inside, `{"$ref": "#"}` means "a formula".
- `when` node: `{"when": <ruleset with x-kind>}`; its `then` / `otherwise` are `{"$ref":
  "#"}`, its conditions point to `urn:pyruleset:when-condition` (embedded in the node's `$defs`).
- Ruleset root: conditions at `urn:pyruleset:condition`, values at `urn:pyruleset:value`.
- Exported in Python as:

  ```python
  predicates = get_expression_json_schema(rules.rules, labels=rules.labels)
  formulas = get_formula_json_schema(
      variables.variables, labels=variables.labels, nodes=[get_when_json_schema(predicates)]
  )
  schema = get_ruleset_json_schema(predicates, formulas)
  ```

## Layout

```
scripts/export_cases.py   writes src/core/cases.json from the Python libraries (pnpm sync)
src/core/                 pure logic, no React; every module has a .test.ts
  tree.ts                 JSON paths shared by the three kinds: at, setAt, pathKey (`$.a[0].b`)
  reader.ts               JSON Schema → catalog (kinds, variables, rules, operators, functions, labels)
  formula.ts              formula tree operations (from salariez formula-tree.ts)
  predicate.ts            predicate tree operations (from salariez query-tree.ts)
  ruleset.ts              branch add / remove / move / label
  validate.ts             Ajv (Draft 2020-12), errors keyed by JSON path
  describe.ts             the "Reads as" line, equal to what Python prints
  python.ts               the definition as Python code
  drafts.ts               localStorage drafts (every call in try/catch)
  i18n.ts                 the ar / en dictionary and direction
src/ui/                   React
  app.tsx                 shell: open schema, open definition, root kind, look switch, output
  looks/rail.tsx, looks/sentence.tsx, looks/tree.tsx, looks/code.tsx
  palette.tsx, controls.tsx
```

## Conventions

- Copy schemify's setup (`../schemify`): `package.json` scripts, `tsconfig.json`,
  `biome.jsonc`, `vite.config.ts`, pnpm, exact versions. Dependencies stay minimal: react,
  react-dom, ajv, ajv-formats; add one only when a phase calls for it.
- The editor holds valid definition JSON at all times; it never parses typed text into a tree,
  except the code view, which only accepts what validates.
- Errors sit on the node that caused them, matched by JSON path.
- Numbers are kept as typed; the editor never does arithmetic on them.
- Arabic and English, RTL and LTR: set `dir` on `<html>`, use logical Tailwind classes
  (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`), and wrap formulas and code in `<bdi dir="ltr">`.
- Plain words in the UI, no jargon: "condition", "otherwise", "value".

## Commands

`pnpm dev`, `pnpm sync`, `pnpm check` (typecheck, Biome, Vitest), `pnpm build`.
