// The palette fills the value chosen (dashed outline): a variable or a number replaces it; an
// operation, a function or a condition takes it inside. Only what the schema allows appears.
import { useState } from "react";
import { SYMBOLS } from "../core/describe.ts";
import { apply, convert, type Formula, operate } from "../core/formula.ts";
import { t, textIn } from "../core/i18n.ts";
import { at, type Json, setAt } from "../core/tree.ts";
import { SHEET, SMALL_INPUT } from "./controls.tsx";
import { useEditor } from "./nodes.tsx";

const PIECE =
  "inline-flex h-7 items-center rounded-[5px] border border-rule-strong bg-sheet px-2.5 text-sm text-ink transition-colors duration-150 hover:border-accent hover:bg-accent-soft hover:text-accent disabled:pointer-events-none disabled:opacity-40";

export function Palette() {
  const { catalog, lang, tree, change, target, setTarget } = useEditor();
  const [search, setSearch] = useState("");
  const node = target ? (at(tree, target) as Formula | undefined) : undefined;
  const ready = node !== undefined;
  const needle = search.trim().toLowerCase();
  const variables = catalog.variables.filter((variable) =>
    `${variable.name} ${textIn(variable.label, lang, "")}`.toLowerCase().includes(needle),
  );

  const put = (next: Formula) => {
    if (!target || node === undefined) {
      setTarget(null);

      return;
    }

    change(setAt(tree, target, next as Json));
  };

  return (
    <aside
      aria-label={t(lang, "insert")}
      className={`${SHEET} flex flex-col gap-3 self-start p-3 xl:sticky xl:top-20`}
    >
      <p className="text-xs text-ink-muted">{t(lang, "paletteHint")}</p>
      {catalog.variables.length > 0 && (
        <Shelf title={t(lang, "variables")}>
          <input
            type="search"
            aria-label={t(lang, "search")}
            placeholder={t(lang, "search")}
            dir="auto"
            className={`${SMALL_INPUT} w-full`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {variables.map((variable) => (
            <button
              key={variable.name}
              type="button"
              disabled={!ready}
              className={PIECE}
              title={variable.description}
              onClick={() => put(variable.name)}
            >
              {textIn(variable.label, lang, variable.name)}
            </button>
          ))}
        </Shelf>
      )}
      <Shelf title={t(lang, "operations")}>
        {catalog.operators.map((operator) => (
          <button
            key={operator}
            type="button"
            disabled={!ready}
            className={`${PIECE} size-8 justify-center px-0 font-mono`}
            aria-label={t(lang, operator)}
            title={t(lang, operator)}
            onClick={() => node !== undefined && put(operate(node, operator))}
          >
            <bdi dir="ltr">{SYMBOLS[operator] ?? operator}</bdi>
          </button>
        ))}
      </Shelf>
      <Shelf title={t(lang, "functions")}>
        {catalog.functions.map((fn) => (
          <button
            key={fn}
            type="button"
            disabled={!ready}
            className={PIECE}
            onClick={() => node !== undefined && put(apply(node, fn))}
          >
            {t(lang, fn)}
          </button>
        ))}
      </Shelf>
      <Shelf title={t(lang, "formula")}>
        <button type="button" disabled={!ready} className={PIECE} onClick={() => put(0)}>
          {t(lang, "number")}
        </button>
        {catalog.when && (
          <button
            type="button"
            disabled={!ready}
            className={PIECE}
            onClick={() => node !== undefined && put(convert(node, "when", ""))}
          >
            {t(lang, "byCondition")}
          </button>
        )}
      </Shelf>
    </aside>
  );
}

function Shelf({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="text-[0.8125rem] text-ink-muted">{title}</h2>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </section>
  );
}
