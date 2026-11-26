// The rail look: a ruleset's cases hung in order off a line down the start edge, each "if" its
// condition "then" its value, closed by "otherwise". A predicate or formula root is its node.

import { t } from "../../core/i18n.ts";
import type { Kind } from "../../core/reader.ts";
import { addBranch, moveBranch, type Ruleset, removeBranch, setLabel } from "../../core/ruleset.ts";
import { at, type Path } from "../../core/tree.ts";
import { ADD_BUTTON, ICON_BUTTON, Icon, REMOVE_BUTTON, SHEET, SMALL_INPUT } from "../controls.tsx";
import { PredicateNode, Problem, useEditor, ValueNode } from "../nodes.tsx";

export function RailLook({ kind }: { kind: Kind }) {
  if (kind === "ruleset") return <Rail path={[]} />;

  if (kind === "predicate") return <PredicateNode path={[]} />;

  return (
    <div className="flex flex-wrap items-center">
      <ValueNode path={[]} />
    </div>
  );
}

/** A ruleset body at `path`: the root, or the `when` of a value node. */
export function Rail({ path }: { path: Path }) {
  const { lang, tree, change } = useEditor();
  const { branches } = at(tree, path) as Ruleset;
  const nested = path.length > 0;

  return (
    <ol className="flex w-full flex-col gap-3 border-s border-rule-strong ps-5">
      {branches.map((branch, index) => {
        const here: Path = [...path, "branches", index];

        return (
          <li
            // cases have no id: their place is their identity, and the order Python tries them
            // biome-ignore lint/suspicious/noArrayIndexKey: see above
            key={index}
            className={`relative flex flex-col gap-3 p-4 ${nested ? "rounded-[6px] border border-rule bg-sheet" : SHEET}`}
          >
            <span
              aria-hidden="true"
              className="absolute -start-8 top-4 grid size-6 place-items-center rounded-full border border-rule-strong bg-sheet text-xs text-ink-muted"
            >
              {index + 1}
            </span>
            <div className="flex items-center gap-2">
              <input
                aria-label={`${t(lang, "caseLabel")} ${index + 1}`}
                placeholder={t(lang, "caseLabel")}
                dir="auto"
                className={`${SMALL_INPUT} min-w-0 flex-1`}
                value={branch.label ?? ""}
                onChange={(e) => change(setLabel(tree, path, index, e.target.value))}
              />
              <button
                type="button"
                className={ICON_BUTTON}
                aria-label={`${t(lang, "moveUp")} ${index + 1}`}
                disabled={index === 0}
                onClick={() => change(moveBranch(tree, path, index, index - 1))}
              >
                <Icon name="up" />
              </button>
              <button
                type="button"
                className={ICON_BUTTON}
                aria-label={`${t(lang, "moveDown")} ${index + 1}`}
                disabled={index === branches.length - 1}
                onClick={() => change(moveBranch(tree, path, index, index + 1))}
              >
                <Icon name="down" />
              </button>
              <button
                type="button"
                className={REMOVE_BUTTON}
                aria-label={`${t(lang, "remove")} ${index + 1}`}
                onClick={() => change(removeBranch(tree, path, index))}
              >
                <Icon name="x" />
              </button>
            </div>
            <Problem path={here} />
            <Part word={t(lang, index === 0 ? "if" : "elseIf")}>
              <PredicateNode path={[...here, "when"]} />
            </Part>
            <Part word={t(lang, "then")}>
              <ValueNode path={[...here, "then"]} />
            </Part>
          </li>
        );
      })}
      <li>
        <button type="button" className={ADD_BUTTON} onClick={() => change(addBranch(tree, path))}>
          <Icon name="plus" />
          {t(lang, "addCase")}
        </button>
      </li>
      <li className="flex flex-col gap-3 rounded-[6px] border border-rule bg-sunken p-4">
        <Part word={t(lang, branches.length ? "otherwise" : "always")}>
          <ValueNode path={[...path, "otherwise"]} />
        </Part>
      </li>
    </ol>
  );
}

function Part({ word, children }: { word: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
      <span className="w-16 shrink-0 pt-1.5 text-sm font-semibold">{word}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
