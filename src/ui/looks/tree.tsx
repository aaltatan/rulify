// The tree look: a decision tree drawn with borders, not a canvas. A start node, a trunk down
// the start edge, a branch per case to its condition and on, along a dashed stub, to its value;
// "otherwise" last. A node pressed opens its editor under the drawing.
import { type ReactNode, useState } from "react";
import { describeFormula, describePredicate } from "../../core/describe.ts";
import type { Formula } from "../../core/formula.ts";
import { t } from "../../core/i18n.ts";
import type { Predicate } from "../../core/predicate.ts";
import { addBranch, type Ruleset } from "../../core/ruleset.ts";
import { at, type Path, pathKey } from "../../core/tree.ts";
import { hasProblemsUnder } from "../../core/validate.ts";
import { ADD_BUTTON, ICON_BUTTON, Icon, SHEET } from "../controls.tsx";
import { CaseTools, PredicateNode, Problem, useEditor, ValueNode } from "../nodes.tsx";

/** The part pressed: a case's condition or value, or the otherwise. */
type Picked = { index: number; part: "when" | "then" } | "otherwise" | null;

export function TreeRules({ path }: { path: Path }) {
  const { lang, tree, problems, change } = useEditor();
  const { branches } = at(tree, path) as Ruleset;
  const [picked, setPicked] = useState<Picked>(null);
  // a case removed under the open editor closes it
  const shown = picked !== "otherwise" && picked && picked.index >= branches.length ? null : picked;
  const marked = (sub: Path) => hasProblemsUnder(problems, pathKey([...path, ...sub]));
  const isPicked = (index: number, part: "when" | "then") =>
    shown !== null && shown !== "otherwise" && shown.index === index && shown.part === part;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="overflow-x-auto pb-1">
        <div className="flex w-max min-w-full items-center">
          <span className="shrink-0 rounded-[6px] border border-rule-strong bg-sheet px-3 py-2 text-sm font-semibold">
            {t(lang, "start")}
          </span>
          <Stub />
          <ol className="flex flex-1 flex-col gap-3 border-s border-rule-strong py-3">
            {branches.map((branch, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: cases have no id but their place
              <li key={index} className="flex items-center">
                <Stub />
                <TreeNode
                  heading={`${index + 1} · ${t(lang, index === 0 ? "if" : "elseIf")}${branch.label ? ` · ${branch.label}` : ""}`}
                  text={describePredicate(branch.when as Predicate)}
                  pressed={isPicked(index, "when")}
                  marked={
                    marked(["branches", index, "when"]) || marked(["branches", index, "label"])
                  }
                  onPress={() => setPicked({ index, part: "when" })}
                />
                <Stub dashed />
                <TreeNode
                  heading={t(lang, "theValue")}
                  text={describeFormula(branch.then as Formula)}
                  pressed={isPicked(index, "then")}
                  marked={marked(["branches", index, "then"])}
                  result
                  onPress={() => setPicked({ index, part: "then" })}
                />
              </li>
            ))}
            <li className="flex items-center">
              <Stub />
              <TreeNode
                heading={t(lang, branches.length ? "otherwise" : "always")}
                text={describeFormula((at(tree, path) as Ruleset).otherwise as Formula)}
                pressed={shown === "otherwise"}
                marked={marked(["otherwise"])}
                result
                onPress={() => setPicked("otherwise")}
              />
            </li>
          </ol>
        </div>
      </div>
      <button type="button" className={ADD_BUTTON} onClick={() => change(addBranch(tree, path))}>
        <Icon name="plus" />
        {t(lang, "addCase")}
      </button>
      {shown === "otherwise" && (
        <Panel title={t(lang, "otherwise")} close={() => setPicked(null)}>
          <ValueNode path={[...path, "otherwise"]} />
        </Panel>
      )}
      {shown && shown !== "otherwise" && (
        <Panel title={`${t(lang, "case")} ${shown.index + 1}`} close={() => setPicked(null)}>
          <CaseTools path={path} index={shown.index} count={branches.length} />
          <Problem path={[...path, "branches", shown.index]} />
          {shown.part === "when" ? (
            <PredicateNode path={[...path, "branches", shown.index, "when"]} />
          ) : (
            <div className="flex flex-wrap items-center">
              <ValueNode path={[...path, "branches", shown.index, "then"]} />
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

function Stub({ dashed = false }: { dashed?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`w-5 shrink-0 border-t border-rule-strong ${dashed ? "border-dashed" : ""}`}
    />
  );
}

function TreeNode({
  heading,
  text,
  pressed,
  marked,
  result = false,
  onPress,
}: {
  heading: string;
  text: string;
  pressed: boolean;
  marked: boolean;
  result?: boolean;
  onPress: () => void;
}) {
  const edge = marked ? "border-danger" : pressed ? "border-accent" : "border-rule";

  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={`flex min-w-0 max-w-72 flex-col items-start gap-0.5 rounded-[6px] border px-3 py-2 text-start transition-colors duration-150 hover:border-ink-muted ${edge} ${result ? "bg-sunken" : "bg-sheet shadow-[0_1px_2px_oklch(0.2_0.05_258/0.06)]"}`}
      onClick={onPress}
    >
      <span className="text-xs text-ink-muted">{heading}</span>
      <bdi dir="ltr" className="max-w-full truncate font-mono text-[0.8125rem]">
        {text}
      </bdi>
    </button>
  );
}

function Panel({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const { lang } = useEditor();

  return (
    <section aria-label={title} className={`${SHEET} flex flex-col gap-3 p-4`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" className={ICON_BUTTON} aria-label={t(lang, "close")} onClick={close}>
          <Icon name="x" />
        </button>
      </div>
      {children}
    </section>
  );
}
