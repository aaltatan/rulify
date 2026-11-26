# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who write business rules without writing Python: payroll and finance staff defining
compensations, deductions, discounts and eligibility, and the developers who hand them the
schema. Arabic first, English too.

## Product Purpose

Build pyruleset rulesets, pyspecification predicates and pyformula formulas visually, from a
JSON Schema exported by those libraries, and get definition JSON (and the same rule as Python
code) that the Python compilers accept as-is.

## Positioning

The libraries are the source of truth: the editor offers only what the uploaded schema allows,
and what it prints ("Reads as", Python code) equals what Python prints, checked by golden cases
generated from Python.

## Capabilities and Constraints

- Frontend only, no backend. React, Tailwind and TypeScript, built like schemify.
- In: a schema file (paste or upload) and, optionally, a saved definition to keep editing.
- Roots: a ruleset, a predicate or a formula; formulas may hold nested rulesets.
- Four looks over the same data: rail + palette, sentence, tree, and a JSON code view.
- Validation only (Ajv), errors on the node; no evaluation on sample data in v1.
- Out: copy or download the JSON, the Python code; drafts autosave in the browser.
- Arabic and English, RTL and LTR; labels come from the schema in both languages.

## Product Principles

- The schema decides what can be built; nothing invalid can be built.
- The rule should read like a sentence before it reads like code.
- Errors sit on the part that caused them.
- What you see is what Python will run.
