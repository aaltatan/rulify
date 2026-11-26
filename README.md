# rulify

Build business rules in the browser: [pyruleset](https://github.com/aaltatan/pyruleset)
rulesets, [pyspecification](https://github.com/aaltatan/pyspecification) predicates and
[pyformula](https://github.com/aaltatan/pyformula) formulas, drawn from a JSON Schema exported
by those libraries. Frontend only, no backend.

- Upload or paste the schema, then build the rule visually: as cards on a rail, as sentences,
  as a decision tree, or as JSON.
- Every part is checked against the schema as you build; errors sit on the part that caused them.
- Copy or download the definition JSON, which the Python compilers accept as-is, or copy the
  same rule as Python code.
- Arabic and English.

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
