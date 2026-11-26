// The code view: the definition JSON in an editable mono area. Typed text is taken only once it
// parses and validates (the editor holds a valid definition at all times); until then the first
// problem shows under it. A plain textarea: no editor library is needed for JSON this size.
import { useEffect, useId, useRef, useState } from "react";
import { problemText, t } from "../../core/i18n.ts";
import type { Json } from "../../core/tree.ts";
import { readDefinition } from "../../core/validate.ts";
import { INPUT } from "../controls.tsx";
import { useEditor } from "../nodes.tsx";

const print = (tree: Json) => JSON.stringify(tree, null, 2);

export function CodeLook() {
  const { lang, tree, change, validate } = useEditor();
  const [text, setText] = useState(() => print(tree));
  // why the text is not taken yet: the path it fails at (none when it is not JSON) and a message
  const [error, setError] = useState<{ path: string | null; message: string } | null>(null);
  const sent = useRef<Json>(tree);
  const errorId = useId();
  const hintId = useId();

  // a definition from elsewhere (a file opened, the kind switched) replaces the text
  useEffect(() => {
    if (tree !== sent.current) {
      sent.current = tree;
      setText(print(tree));
      setError(null);
    }
  }, [tree]);

  const edit = (typed: string) => {
    setText(typed);

    const reading = readDefinition(typed, validate);

    if (reading.ok) {
      sent.current = reading.definition;
      change(reading.definition);
      setError(null);
    } else if (reading.path === null) {
      setError({ path: null, message: t(lang, "notJson") });
    } else {
      setError({
        path: reading.path,
        message: problemText(lang, reading.problem.keyword, reading.problem.message),
      });
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        aria-label={t(lang, "definitionJson")}
        aria-invalid={error !== null || undefined}
        aria-describedby={error ? errorId : hintId}
        dir="ltr"
        spellCheck={false}
        className={`${INPUT} h-[28rem] w-full resize-y py-3 font-mono text-xs leading-relaxed`}
        value={text}
        onChange={(e) => edit(e.target.value)}
      />
      {error ? (
        <p id={errorId} role="status" className="text-xs text-danger">
          {error.path && (
            <bdi dir="ltr" className="me-2 font-mono">
              {error.path}
            </bdi>
          )}
          {error.message}
        </p>
      ) : (
        <p id={hintId} className="text-xs text-ink-muted">
          {t(lang, "codeHint")}
        </p>
      )}
    </div>
  );
}
