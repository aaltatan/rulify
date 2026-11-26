// Opening files: the schema drop area shown before a schema is open, and reading JSON files.
import { useId, useState } from "react";
import { type Lang, t } from "../core/i18n.ts";
import { ADD_BUTTON, BUTTON, GHOST_BUTTON, Icon, INPUT } from "./controls.tsx";

/** The JSON in a file the user picked or dropped; throws when it does not parse. */
export async function readJsonFile(file: File): Promise<unknown> {
  return JSON.parse(await file.text());
}

/**
 * Drop, choose or paste a schema. `onOpen` returns why a schema was refused, in plain words,
 * or null when it opened.
 */
export function SchemaDrop({
  lang,
  onOpen,
}: {
  lang: Lang;
  onOpen: (schema: unknown) => string | null;
}) {
  const [over, setOver] = useState(false);
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileId = useId();
  const errorId = useId();

  const openText = (text: string) => {
    try {
      setError(onOpen(JSON.parse(text)));
    } catch {
      setError(t(lang, "notJson"));
    }
  };

  const openFile = async (file: File | undefined) => {
    if (file) openText(await file.text());
  };

  const openSample = async () => {
    // a separate chunk: only those who ask for the sample load it
    const { default: cases } = await import("../core/cases.json");

    setError(onOpen(cases.schemas["payroll-ruleset"]));
  };

  return (
    <section
      aria-label={t(lang, "openSchema")}
      aria-describedby={error ? errorId : undefined}
      className={`flex flex-col gap-4 rounded-[6px] border border-dashed p-8 transition-colors duration-150 ${over ? "border-accent bg-accent-soft" : "border-rule-strong bg-sheet"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void openFile(e.dataTransfer.files[0]);
      }}
    >
      <h2 className="text-lg font-semibold">{t(lang, "openSchema")}</h2>
      <p className="text-sm text-ink-muted">{t(lang, "dropSchema")}</p>
      <div className="flex flex-wrap gap-2">
        <label htmlFor={fileId} className={`${GHOST_BUTTON} cursor-pointer`}>
          <Icon name="upload" />
          {t(lang, "chooseFile")}
        </label>
        <input
          id={fileId}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={(e) => {
            void openFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button type="button" className={ADD_BUTTON} onClick={() => void openSample()}>
          {t(lang, "trySample")}
        </button>
      </div>
      <textarea
        aria-label={t(lang, "pasteSchema")}
        placeholder={t(lang, "pasteSchema")}
        dir="ltr"
        spellCheck={false}
        className={`${INPUT} h-32 resize-y py-2 font-mono text-xs`}
        value={pasted}
        onChange={(e) => setPasted(e.target.value)}
      />
      <button
        type="button"
        disabled={!pasted.trim()}
        className={`${BUTTON} self-start bg-accent text-on-accent hover:bg-accent-hover`}
        onClick={() => openText(pasted)}
      >
        {t(lang, "open")}
      </button>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
