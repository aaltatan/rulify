# PHASES

## Phase 0 — Library prerequisites (in the Python repos, each with pytest tests and a release)
- [x] pyvocabulary: helpers that add `x-label` / `x-description` (a `{lang: text}` map or a
      string) and `x-choices` to a schema; `call_json_schema` takes them
      (`Text`, `labelled`, `Label`, `Choices`, `Vocabulary.labels`; 0.2.0, branch `feat/labels`)
- [x] pyformula: `get_formula_json_schema(variables, operators=..., functions=...)` with
      `x-kind: "formula"` and each variable's `x-label` (plus `labels=`, `nodes=`; 0.3.0, branch
      `feat/json-schema`)
- [x] pyspecification: registries accept labels per language; `get_expression_json_schema`
      emits `x-kind: "predicate"`, `x-label`, `x-field` / `x-operator` and inline `x-choices`
      (4.2.0, branch `feat/labels`)
- [x] pyruleset: own the `{"when": <ruleset>}` formula node (a value compiler wrapping a
      `FormulaCompiler`, and its schema helper), moving the idea out of salariez's
      `SalariezCompiler`; `get_ruleset_json_schema` emits `x-kind: "ruleset"` (`WhenCompiler`,
      `get_when_json_schema`; 0.2.0, branch `feat/when-node`)
- [x] Write the final x- keyword table into `CLAUDE.md`
- [x] Released and pushed to GitHub `main` (2026-11-26): pyvocabulary 0.2.0, pyformula 0.3.0,
      pyspecification 4.2.0, pyruleset 0.2.0; checked together from PyPI with the export recipe

## Phase 1 — Scaffold
- [x] Copy schemify's setup: Vite, React 19, TypeScript, Tailwind 4, Biome, Vitest, pnpm, Ajv
- [x] `scripts/export_cases.py` and `pnpm sync`: sample schemas and definitions with what Python
      prints and their Python code → `src/core/cases.json` (20 payroll cases; each snippet is run
      and checked against the compiled definition; `cases.test.ts` validates them with Ajv)
- [x] `DESIGN.md` (impeccable), `README.md`, `.gitignore`, git init (schemify's world inherited,
      system font stack; `.impeccable/design.json` sidecar)
- [x] Publish pyruleset 0.2.1 (root `$ref` in `allOf` for Ajv), on PyPI and GitHub `main`

## Phase 2 — Core (pure logic, Vitest against cases.json)
- [x] `reader.ts`: schema → catalog by `x-kind`; labels in the chosen language (`textIn` in `i18n.ts`)
- [x] `formula.ts`, `predicate.ts`, `ruleset.ts`: tree operations (port from salariez), on the
      shared JSON paths of `tree.ts`; every edit is checked to stay valid
- [x] `validate.ts`: Ajv Draft 2020-12, errors keyed by JSON path (`$.branches[0].when`), on the
      deepest node, other rules' complaints dropped
- [x] `describe.ts` ("Reads as") and `python.ts` (code export) equal to the cases (all 20)
- [x] `drafts.ts`, `i18n.ts`
- Known limit: a call with a required positional argument left out of both `args` and `kwargs`
  passes the schema (it cannot require one of the two); Python's compiler reports it. New calls
  always fill required arguments.

## Phase 3 — Shell and the rail look
- [x] Open a schema (paste / upload / drop, or the payroll sample), open a definition (it opens
      as the first kind it validates as), choose the root kind (each kind's schema is the one the
      libraries embed: `subschemas` in `reader.ts`)
- [x] Rail + palette for rulesets, predicates and formulas, including nested `when`
- [x] Errors on the node; the "Reads as" line (plus a problems list and the JSON printed
      read-only beside the sheet; copy / download come in Phase 6)
- Left for later: cases do not fold or drag yet (move buttons only); list and object arguments
  show as JSON, edited in the code view (Phase 5); an absent optional keyword argument cannot be
  added from the rail.

## Phase 4 — Sentence and tree looks
- [ ] Sentence look; tree look; a switch between the looks over the same data

## Phase 5 — Code view
- [ ] A JSON editor synced with the visual looks; accepts only what validates (pick the editor
      library here; prefer a light one)

## Phase 6 — Output, languages, drafts
- [ ] Copy / download JSON; Python code view with copy
- [ ] Arabic and English with RTL / LTR; autosaved drafts

## Phase 7 — Release
- [ ] GitHub repository `aaltatan/rulify`, deploy to rulify.surge.sh
- [ ] README: how to export a schema from Python (3-line script), the looks, the output
