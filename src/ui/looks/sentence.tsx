// The sentence look: the same definition as running sentences, "If … then …", "Else if …",
// "Otherwise …". A group reads as its conditions joined by "and" / "or" (the joiner is the
// switch), a nested group in brackets; rule calls and values are the shared node editors.
import { Fragment } from "react";
import { t, textIn } from "../../core/i18n.ts";
import {
  addNode,
  type Group,
  isGroup,
  newCall,
  type Predicate,
  removeNode,
  setOperator,
} from "../../core/predicate.ts";
import { addBranch, type Ruleset } from "../../core/ruleset.ts";
import { at, type Path } from "../../core/tree.ts";
import { ADD_BUTTON, Icon, REMOVE_BUTTON } from "../controls.tsx";
import { CaseTools, PredicateNode, Problem, useEditor, ValueNode } from "../nodes.tsx";

const SENTENCE = "text-[0.9375rem] leading-[2.75rem]";

/** A changeable word: a select drawn as the word, with a dotted underline. */
const WORD =
  "cursor-pointer appearance-none rounded-[4px] border-0 border-b border-dotted border-rule-strong bg-transparent px-1 font-semibold text-ink transition-colors duration-150 hover:bg-sunken focus:outline-2 focus:outline-accent";

export function SentenceRules({ path }: { path: Path }) {
  const { lang, tree, change } = useEditor();
  const { branches } = at(tree, path) as Ruleset;

  return (
    <div className={`flex w-full flex-col gap-1 ${SENTENCE}`}>
      {branches.map((_, index) => {
        const here: Path = [...path, "branches", index];

        return (
          <section
            // biome-ignore lint/suspicious/noArrayIndexKey: cases have no id but their place
            key={index}
            aria-label={`${t(lang, "case")} ${index + 1}`}
            className="flex flex-col gap-1 rounded-[5px] px-2 py-1 transition-colors duration-150 hover:bg-sunken/60"
          >
            <CaseTools path={path} index={index} count={branches.length} />
            <div>
              <strong className="me-2 font-semibold">
                {t(lang, index === 0 ? "if" : "elseIf")}
              </strong>
              <SentenceCondition path={[...here, "when"]} />
            </div>
            <div className="ps-6">
              <strong className="me-2 font-semibold">{t(lang, "then")}</strong>
              <ValueNode path={[...here, "then"]} />
            </div>
            <Problem path={here} />
          </section>
        );
      })}
      <div className="px-2 py-1">
        <strong className="me-2 font-semibold">
          {t(lang, branches.length ? "otherwise" : "always")}
        </strong>
        <ValueNode path={[...path, "otherwise"]} />
      </div>
      <button type="button" className={ADD_BUTTON} onClick={() => change(addBranch(tree, path))}>
        <Icon name="plus" />
        {t(lang, "addCase")}
      </button>
    </div>
  );
}

/** A condition as words: a call is its row, a group its items joined by "and" / "or". */
export function SentenceCondition({ path }: { path: Path }) {
  const { tree } = useEditor();
  const node = at(tree, path) as Predicate;

  if (!isGroup(node)) return <PredicateNode path={path} />;

  return <GroupWords path={path} node={node} />;
}

function GroupWords({ path, node }: { path: Path; node: Group }) {
  const { catalog, lang, tree, change } = useEditor();
  const nested = typeof path[path.length - 1] === "number";

  return (
    <span className={SENTENCE}>
      {nested && <span className="text-ink-muted">(</span>}
      {node.expressions.length === 0 && (
        <span className="text-ink-muted">
          {t(lang, node.operator === "all" ? "always" : "never")}
        </span>
      )}
      {node.expressions.map((item, index) => {
        const here: Path = [...path, "expressions", index];

        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: conditions have no id but their place
          <Fragment key={index}>
            {index > 0 && (
              <select
                aria-label={t(lang, "kind")}
                className={`${WORD} mx-1.5`}
                value={node.operator}
                onChange={(e) =>
                  change(setOperator(tree, path, e.target.value as Group["operator"]))
                }
              >
                <option value="all">{t(lang, "and")}</option>
                <option value="any">{t(lang, "or")}</option>
              </select>
            )}
            <SentenceCondition path={here} />
            {isGroup(item) && (
              <button
                type="button"
                className={`${REMOVE_BUTTON} inline-grid size-6 align-middle`}
                aria-label={t(lang, "remove")}
                onClick={() => change(removeNode(tree, here))}
              >
                <Icon name="x" className="size-3.5" />
              </button>
            )}
          </Fragment>
        );
      })}
      <select
        aria-label={t(lang, "addCondition")}
        className={`${WORD} mx-1.5 font-normal text-ink-muted`}
        value=""
        onChange={(e) => {
          const value = e.target.value;
          const rule = catalog.rules.find((item) => item.name === value);

          if (value === "group") change(addNode(tree, path, { operator: "any", expressions: [] }));
          else if (rule) change(addNode(tree, path, newCall(rule)));
        }}
      >
        <option value="">+ {t(lang, "addCondition")}</option>
        {catalog.rules.map((rule) => (
          <option key={rule.name} value={rule.name}>
            {textIn(rule.label, lang, rule.name)}
          </option>
        ))}
        <option value="group">{t(lang, "addGroup")}</option>
      </select>
      {nested && <span className="text-ink-muted">)</span>}
      <Problem path={path} />
    </span>
  );
}
