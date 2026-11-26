// The shell: open a schema, choose what to build from it (a ruleset, a condition or a value),
// edit it in the rail look, read it back ("Reads as") and see its JSON printed beside it.
import { useEffect, useId, useMemo, useState } from "react";
import { describe } from "../core/describe.ts";
import { dirOf, type Lang, problemText, t } from "../core/i18n.ts";
import { emptyGroup } from "../core/predicate.ts";
import { type Kind, readSchema, SchemaError, subschemas } from "../core/reader.ts";
import { emptyRuleset } from "../core/ruleset.ts";
import type { Json, Path } from "../core/tree.ts";
import { makeValidator, type Problem } from "../core/validate.ts";
import { GHOST_BUTTON, Icon, Logo, Segmented } from "./controls.tsx";
import { Rail, RailLook } from "./looks/rail.tsx";
import { EditorContext } from "./nodes.tsx";
import { readJsonFile, SchemaDrop } from "./open.tsx";
import { Palette } from "./palette.tsx";

const KIND_ORDER: readonly Kind[] = ["ruleset", "predicate", "formula"];

function emptyOf(kind: Kind): Json {
  if (kind === "ruleset") return emptyRuleset() as Json;

  if (kind === "predicate") return emptyGroup() as Json;

  return 0;
}

export function App() {
  const [lang, setLang] = useState<Lang>("ar");
  const [root, setRoot] = useState<unknown>(null);
  const [kind, setKind] = useState<Kind>("ruleset");
  const [definition, setDefinition] = useState<Json>(null);
  const [target, setTarget] = useState<Path | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const definitionId = useId();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dirOf(lang);
  }, [lang]);

  const kinds = useMemo(() => subschemas(root), [root]);
  const schema = kinds[kind];
  const catalog = useMemo(() => (schema ? readSchema(schema) : null), [schema]);
  const validate = useMemo(() => (schema ? makeValidator(schema) : null), [schema]);
  const problems = useMemo(() => validate?.(definition) ?? {}, [validate, definition]);
  const problemCount = Object.values(problems).flat().length;

  const choose = (next: Kind) => {
    setKind(next);
    setDefinition(emptyOf(next));
    setTarget(null);
    setOpenError(null);
  };

  const openSchema = (candidate: unknown): string | null => {
    try {
      const { kind: rootKind } = readSchema(candidate);

      // compile each part once here, so a schema Ajv refuses is refused at the door
      for (const part of Object.values(subschemas(candidate))) makeValidator(part);

      setRoot(candidate);
      choose(rootKind);

      return null;
    } catch (error) {
      if (error instanceof SchemaError) return t(lang, "notRulify");

      return `${t(lang, "badSchema")} ${(error as Error).message}`;
    }
  };

  /** A definition opens as the first kind it validates as; else the first problem says why. */
  const openDefinition = async (file: File | undefined) => {
    if (!file) return;

    let candidate: unknown;

    try {
      candidate = await readJsonFile(file);
    } catch {
      setOpenError(t(lang, "notJson"));

      return;
    }

    const order = [kind, ...KIND_ORDER.filter((other) => other !== kind)];
    const refusals: [string, Problem | undefined][] = [];

    for (const other of order) {
      const part = kinds[other];

      if (!part) continue;

      const found = makeValidator(part)(candidate as Json);
      const [path, list] = Object.entries(found)[0] ?? [];

      if (!path) {
        setKind(other);
        setDefinition(candidate as Json);
        setTarget(null);
        setOpenError(null);

        return;
      }

      refusals.push([path, list?.[0]]);
    }

    // a problem below the root comes from the kind the file was meant as
    const [path, problem] = refusals.find(([at]) => at !== "$") ?? refusals[0] ?? ["$", undefined];

    setOpenError(
      `${t(lang, "definitionRefused")} ${path}: ${problemText(lang, problem?.keyword ?? "", problem?.message ?? "")}`,
    );
  };

  let readsAs = "";

  try {
    readsAs = catalog ? describe(kind, definition) : "";
  } catch {
    // a definition mid-edit may not describe yet; its problems say why
  }

  return (
    <div className="flex min-h-screen flex-col text-ink">
      <header className="sticky top-0 z-40 border-b border-rule bg-sheet/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
          <h1 className="flex items-center gap-2.5">
            <Logo />
            <span className="text-base font-semibold" lang="en">
              rulify
            </span>
          </h1>
          <Segmented
            label={t(lang, "language")}
            value={lang}
            options={[
              ["ar", "ع"],
              ["en", "EN"],
            ]}
            onChange={setLang}
          />
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-7xl flex-1 content-start gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-8">
        {!catalog ? (
          <div className="lg:col-span-2">
            <SchemaDrop lang={lang} onOpen={openSchema} />
          </div>
        ) : (
          <>
            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <Segmented
                  label={t(lang, "kind")}
                  value={kind}
                  options={KIND_ORDER.filter((name) => kinds[name]).map(
                    (name) => [name, t(lang, name)] as const,
                  )}
                  onChange={choose}
                />
                <span className="ms-auto flex flex-wrap gap-2">
                  <label htmlFor={definitionId} className={`${GHOST_BUTTON} cursor-pointer`}>
                    <Icon name="upload" />
                    {t(lang, "openDefinition")}
                  </label>
                  <input
                    id={definitionId}
                    type="file"
                    accept=".json,application/json"
                    className="sr-only"
                    onChange={(e) => {
                      void openDefinition(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <button type="button" className={GHOST_BUTTON} onClick={() => setRoot(null)}>
                    {t(lang, "otherSchema")}
                  </button>
                </span>
              </div>
              {openError && (
                <p role="alert" className="text-sm text-danger">
                  {openError}
                </p>
              )}
              <EditorContext
                value={{
                  catalog,
                  lang,
                  problems,
                  tree: definition,
                  change: setDefinition,
                  target,
                  setTarget,
                  Rules: Rail,
                }}
              >
                <div
                  className={
                    kind === "predicate"
                      ? ""
                      : "grid gap-4 xl:grid-cols-[16rem_minmax(0,1fr)] xl:items-start"
                  }
                >
                  {kind !== "predicate" && <Palette />}
                  <div className="min-w-0">
                    <RailLook kind={kind} />
                  </div>
                </div>
              </EditorContext>
              <section
                aria-label={t(lang, "readsAs")}
                className="flex flex-col gap-1 rounded-[5px] bg-sunken px-3 py-2"
              >
                <h2 className="text-[0.8125rem] text-ink-muted">{t(lang, "readsAs")}</h2>
                <bdi dir="ltr" className="font-mono text-[0.8125rem] break-words">
                  {readsAs}
                </bdi>
              </section>
              {problemCount > 0 && (
                <section aria-label={t(lang, "problems")} className="flex flex-col gap-1">
                  <h2 className="text-[0.8125rem] text-danger">
                    {t(lang, "problems")} ({problemCount})
                  </h2>
                  <ul className="flex flex-col gap-0.5 text-xs">
                    {Object.entries(problems).flatMap(([path, list]) =>
                      list.map((problem) => (
                        <li key={`${path} ${problem.keyword}`} className="flex gap-2">
                          <bdi dir="ltr" className="font-mono text-ink-muted">
                            {path}
                          </bdi>
                          <span className="text-danger">
                            {problemText(lang, problem.keyword, problem.message)}
                          </span>
                        </li>
                      )),
                    )}
                  </ul>
                </section>
              )}
            </div>
            <aside
              aria-label={t(lang, "definition")}
              className="flex min-h-[20rem] flex-col overflow-hidden rounded-[6px] border border-print-rule bg-print text-print-ink shadow-[0_10px_30px_-12px_oklch(0.2_0.06_258/0.45)] lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:self-start"
            >
              <div className="flex items-center gap-2.5 border-b border-print-rule px-4 py-2.5">
                <span
                  className={`size-2 shrink-0 rounded-full ${problemCount ? "bg-[oklch(0.72_0.16_25)]" : "bg-[oklch(0.78_0.13_160)]"}`}
                  aria-hidden="true"
                />
                <span className="text-xs text-print-ink/75" role="status">
                  {problemCount ? `${t(lang, "problems")}: ${problemCount}` : t(lang, "valid")}
                </span>
              </div>
              <pre
                dir="ltr"
                className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed"
              >
                {JSON.stringify(definition, null, 2)}
              </pre>
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
