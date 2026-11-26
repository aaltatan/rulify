// The blueprint panel: the definition printed as JSON or as Python code, navy in both themes,
// with Copy and Download. The JSON is what the Python compilers take as-is.
import { useState } from "react";
import { type Lang, t } from "../core/i18n.ts";
import { python } from "../core/python.ts";
import type { Kind } from "../core/reader.ts";
import type { Json } from "../core/tree.ts";
import { BUTTON, Icon } from "./controls.tsx";

type Tab = "json" | "python";

export function Blueprint({
  lang,
  kind,
  definition,
  problemCount,
}: {
  lang: Lang;
  kind: Kind;
  definition: Json;
  problemCount: number;
}) {
  const [tab, setTab] = useState<Tab>("json");
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  let text = JSON.stringify(definition, null, 2);

  if (tab === "python") {
    try {
      text = python(kind, definition);
    } catch {
      // a definition with problems may not print as Python; they are listed under the sheet
      text = "";
    }
  }

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopy("copied");
    } catch {
      // clipboard blocked (no permission, not a secure page)
      setCopy("failed");
    }

    setTimeout(() => setCopy("idle"), 1500);
  };

  const download = () => {
    const type = tab === "json" ? "application/json" : "text/x-python";
    const url = URL.createObjectURL(new Blob([`${text}\n`], { type }));
    const name = `${kind}.${tab === "json" ? "json" : "py"}`;

    Object.assign(document.createElement("a"), { href: url, download: name }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside
      aria-label={t(lang, "output")}
      className="flex min-h-[20rem] flex-col overflow-hidden rounded-[6px] border border-print-rule bg-print text-print-ink shadow-[0_10px_30px_-12px_oklch(0.2_0.06_258/0.45)] lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:self-start"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-print-rule py-2 ps-4 pe-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`size-2 shrink-0 rounded-full ${problemCount ? "bg-[oklch(0.72_0.16_25)]" : "bg-[oklch(0.78_0.13_160)]"}`}
            aria-hidden="true"
          />
          <span className="text-xs text-print-ink/75" role="status">
            {problemCount ? `${t(lang, "problems")}: ${problemCount}` : t(lang, "valid")}
          </span>
          <fieldset aria-label={t(lang, "output")} className="flex gap-0.5" dir="ltr">
            {(["json", "python"] as const).map((name) => (
              <label key={name} className="cursor-pointer">
                <input
                  type="radio"
                  name="blueprint-tab"
                  className="peer sr-only"
                  checked={tab === name}
                  onChange={() => setTab(name)}
                />
                <span className="grid h-7 place-items-center rounded-[4px] px-2.5 text-sm font-medium text-print-ink/70 transition-colors duration-150 hover:text-print-ink peer-checked:bg-print-rule peer-checked:text-print-ink peer-focus-visible:outline-2 peer-focus-visible:outline-print-ink">
                  {name === "json" ? "JSON" : "Python"}
                </span>
              </label>
            ))}
          </fieldset>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            disabled={problemCount > 0 || !text}
            className={`${BUTTON} h-8 text-print-ink/80 hover:bg-print-rule hover:text-print-ink`}
            onClick={() => void copyText()}
          >
            <Icon name={copy === "copied" ? "check" : "copy"} className="size-3.5" />
            {t(lang, copy === "copied" ? "copied" : copy === "failed" ? "copyFailed" : "copy")}
          </button>
          <button
            type="button"
            disabled={problemCount > 0 || !text}
            className={`${BUTTON} h-8 bg-print-ink text-print hover:bg-white`}
            onClick={download}
          >
            <Icon name="download" className="size-3.5" />
            {t(lang, "download")}
          </button>
        </div>
      </div>
      <pre dir="ltr" className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
        {text}
      </pre>
    </aside>
  );
}
