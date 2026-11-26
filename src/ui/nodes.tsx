// The node editors every look shares: a formula's value nodes, a condition's groups and rule
// calls, and a call's arguments. Each node edits the one tree through `change`, finds its
// problems by its JSON path, and leaves the drawing of a ruleset to the look (`Rules`).
import { type ComponentType, createContext, Fragment, type ReactNode, useContext } from "react";
import { SYMBOLS } from "../core/describe.ts";
import {
  addTerm,
  type Formula,
  functionOf,
  kindOf,
  type Operation,
  type Rounded,
  removeTerm,
  setFunction,
} from "../core/formula.ts";
import { type Lang, problemText, t, textIn } from "../core/i18n.ts";
import {
  addNode,
  type Call,
  emptyGroup,
  type Group,
  isGroup,
  moveNode,
  newCall,
  type Predicate,
  removeNode,
  setOperator,
  toggleInverse,
} from "../core/predicate.ts";
import type { Catalog, Param } from "../core/reader.ts";
import { at, type Json, type Path, pathKey, setAt } from "../core/tree.ts";
import type { Problems } from "../core/validate.ts";
import {
  ADD_BUTTON,
  ICON_BUTTON,
  Icon,
  INPUT,
  NumberInput,
  ProblemText,
  REMOVE_BUTTON,
  Segmented,
  SMALL_INPUT,
} from "./controls.tsx";

export type Editor = {
  catalog: Catalog;
  lang: Lang;
  problems: Problems;
  tree: Json;
  change: (tree: Json) => void;
  /** The value the palette fills, chosen by focusing it. */
  target: Path | null;
  setTarget: (path: Path | null) => void;
  /** How the look draws a ruleset body at `path` (the root, or inside a `when` node). */
  Rules: ComponentType<{ path: Path }>;
};

export const EditorContext = createContext<Editor | null>(null);

export function useEditor(): Editor {
  const editor = useContext(EditorContext);

  if (!editor) throw new Error("useEditor outside an EditorContext");

  return editor;
}

/** The problems sitting exactly on `path`, as text under the node, with the id to point at. */
export function useProblems(path: Path): { id: string; text: string | null } {
  const { problems, lang } = useEditor();
  const key = pathKey(path);
  const found = problems[key] ?? [];
  const text = found.length
    ? found.map((problem) => problemText(lang, problem.keyword, problem.message)).join(" ")
    : null;

  return { id: `problem-${key}`, text };
}

export function Problem({ path }: { path: Path }) {
  const { id, text } = useProblems(path);

  return text ? <ProblemText id={id}>{text}</ProblemText> : null;
}

/** Names from the schema are data: shown left to right, in mono when no label stands in. */
export function Name({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return (
    <bdi dir="ltr" className={mono ? "font-mono text-[0.8125rem]" : undefined}>
      {children}
    </bdi>
  );
}

// -----------------------
// formulas
// -----------------------

const NODE = "inline-flex max-w-full flex-wrap items-center gap-2 rounded-[5px] align-middle";

/**
 * One node of a formula: a number, a variable, an operation written between its terms, a
 * function boxed around its value, or a ruleset. Focusing it makes it the palette's target.
 */
export function ValueNode({ path }: { path: Path }) {
  const editor = useEditor();
  const { catalog, lang, tree, change, target, setTarget, Rules } = editor;
  const node = (at(tree, path) ?? 0) as Formula;
  const kind = kindOf(node);
  const problem = useProblems(path);
  const chosen = target !== null && pathKey(target) === pathKey(path);
  const set = (value: Json, sub: Path = []) => change(setAt(tree, [...path, ...sub], value));

  const look = [
    kind === "when" ? "flex w-full flex-col gap-3 p-3" : `${NODE} p-1`,
    chosen
      ? "bg-accent-soft outline-1 outline-accent outline-dashed"
      : problem.text
        ? "border border-danger bg-danger-soft"
        : "bg-sunken",
  ].join(" ");

  return (
    <fieldset
      aria-label={t(lang, kind === "when" ? "byCondition" : "formula")}
      aria-describedby={problem.text ? problem.id : undefined}
      className={look}
      onFocus={(e) => {
        // the innermost value focused is the one the palette fills
        e.stopPropagation();
        setTarget(path);
      }}
    >
      {kind === "number" && (
        <NumberInput
          label={t(lang, "number")}
          invalid={problem.text !== null}
          value={node as number}
          onChange={(value) => set(value)}
        />
      )}
      {kind === "variable" && (
        <select
          aria-label={t(lang, "variable")}
          aria-invalid={problem.text !== null || undefined}
          className={`${SMALL_INPUT} max-w-48`}
          value={node as string}
          onChange={(e) => set(e.target.value)}
        >
          {!catalog.variables.some((variable) => variable.name === node) && (
            <option value={node as string}>{node as string}</option>
          )}
          {catalog.variables.map((variable) => (
            <option key={variable.name} value={variable.name}>
              {textIn(variable.label, lang, variable.name)}
            </option>
          ))}
        </select>
      )}
      {kind === "operation" && <Terms path={path} />}
      {kind === "function" && <Applied path={path} node={node} />}
      {kind === "when" && (
        <>
          <span className="text-[0.8125rem] font-semibold">{t(lang, "byCondition")}</span>
          <Rules path={[...path, "when"]} />
        </>
      )}
      {problem.text && <ProblemText id={problem.id}>{problem.text}</ProblemText>}
    </fieldset>
  );
}

/** An operation's terms in a row, its operator between each two (changing one changes all). */
function Terms({ path }: { path: Path }) {
  const { catalog, lang, tree, change } = useEditor();
  const { operator, expressions } = at(tree, path) as Operation;

  return (
    <>
      {expressions.map((_, index) => (
        // terms have no id: the index is their identity, as in the JSON
        // biome-ignore lint/suspicious/noArrayIndexKey: see above
        <Fragment key={index}>
          {index > 0 && (
            <select
              aria-label={t(lang, "operations")}
              title={t(lang, operator)}
              dir="ltr"
              className={`${SMALL_INPUT} w-14 px-1 text-center font-mono`}
              value={operator}
              onChange={(e) => change(setAt(tree, [...path, "operator"], e.target.value))}
            >
              {catalog.operators.map((name) => (
                <option key={name} value={name}>
                  {SYMBOLS[name] ?? name}
                </option>
              ))}
            </select>
          )}
          <ValueNode path={[...path, "expressions", index]} />
          {expressions.length > 2 && (
            <button
              type="button"
              className={`${REMOVE_BUTTON} size-6`}
              aria-label={t(lang, "remove")}
              onClick={() => change(removeTerm(tree, path, index))}
            >
              <Icon name="x" className="size-3.5" />
            </button>
          )}
        </Fragment>
      ))}
      <button
        type="button"
        className={`${ICON_BUTTON} size-7 border border-dashed border-rule-strong hover:border-accent hover:bg-accent-soft hover:text-accent`}
        aria-label={t(lang, "addTerm")}
        title={t(lang, "addTerm")}
        onClick={() => change(addTerm(tree, path))}
      >
        <Icon name="plus" className="size-3.5" />
      </button>
    </>
  );
}

/** A function boxed around its value; `round` adds its decimal places. */
function Applied({ path, node }: { path: Path; node: Formula }) {
  const { catalog, lang, tree, change } = useEditor();
  const name = functionOf(node) as string;

  return (
    <>
      <select
        aria-label={t(lang, "functions")}
        className={`${SMALL_INPUT} max-w-44`}
        value={name}
        onChange={(e) => change(setAt(tree, path, setFunction(node, e.target.value) as Json))}
      >
        {catalog.functions.map((fn) => (
          <option key={fn} value={fn}>
            {t(lang, fn)}
          </option>
        ))}
      </select>
      <ValueNode path={[...path, name]} />
      {name === "round" && (
        <NumberInput
          label={t(lang, "decimals")}
          className="w-14"
          value={(node as Rounded).ndigits}
          onChange={(value) => change(setAt(tree, [...path, "ndigits"], value))}
        />
      )}
    </>
  );
}

// -----------------------
// conditions
// -----------------------

/** A condition: a group drawn as a bracket, or a rule call as a row. */
export function PredicateNode({ path }: { path: Path }) {
  const { tree } = useEditor();
  const node = at(tree, path) as Predicate;

  return isGroup(node) ? (
    <GroupNode path={path} node={node} />
  ) : (
    <CallNode path={path} node={node} />
  );
}

/** Whether `path` is an item of a group, so it can be moved or removed there. */
const inGroup = (path: Path) => typeof path[path.length - 1] === "number";

function ItemTools({ path }: { path: Path }) {
  const { lang, tree, change } = useEditor();

  if (!inGroup(path)) return null;

  const index = path[path.length - 1] as number;
  const count = (at(tree, path.slice(0, -1)) as Json[]).length;

  return (
    <span className="ms-auto flex shrink-0">
      <button
        type="button"
        className={ICON_BUTTON}
        aria-label={t(lang, "moveUp")}
        disabled={index === 0}
        onClick={() => change(moveNode(tree, path, -1))}
      >
        <Icon name="up" />
      </button>
      <button
        type="button"
        className={ICON_BUTTON}
        aria-label={t(lang, "moveDown")}
        disabled={index === count - 1}
        onClick={() => change(moveNode(tree, path, 1))}
      >
        <Icon name="down" />
      </button>
      <button
        type="button"
        className={REMOVE_BUTTON}
        aria-label={t(lang, "remove")}
        onClick={() => change(removeNode(tree, path))}
      >
        <Icon name="x" />
      </button>
    </span>
  );
}

function GroupNode({ path, node }: { path: Path; node: Group }) {
  const { catalog, lang, tree, change } = useEditor();
  const problem = useProblems(path);

  return (
    <fieldset
      aria-label={t(lang, node.operator)}
      aria-describedby={problem.text ? problem.id : undefined}
      className={`flex w-full flex-col gap-2 border-s ps-3 ${problem.text ? "border-danger" : "border-rule-strong"}`}
    >
      <div className="flex items-center gap-2">
        <Segmented
          label={t(lang, "kind")}
          value={node.operator}
          options={[
            ["all", t(lang, "all")],
            ["any", t(lang, "any")],
          ]}
          onChange={(operator) => change(setOperator(tree, path, operator))}
        />
        <ItemTools path={path} />
      </div>
      {node.expressions.map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: conditions have no id but their place
        <PredicateNode key={index} path={[...path, "expressions", index]} />
      ))}
      {node.expressions.length === 0 && (
        <p className="rounded-[5px] border border-dashed border-rule-strong px-3 py-2 text-[0.8125rem] text-ink-muted">
          {t(lang, "noConditions")}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={t(lang, "addCondition")}
          className={`${INPUT} max-w-64 border-dashed text-ink-muted`}
          value=""
          onChange={(e) => {
            const rule = catalog.rules.find((item) => item.name === e.target.value);

            if (rule) change(addNode(tree, path, newCall(rule)));
          }}
        >
          <option value="">{t(lang, "addCondition")}</option>
          {catalog.rules.map((rule) => (
            <option key={rule.name} value={rule.name}>
              {textIn(rule.label, lang, rule.name)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`${ADD_BUTTON} h-9`}
          onClick={() => change(addNode(tree, path, emptyGroup()))}
        >
          <Icon name="group" />
          {t(lang, "addGroup")}
        </button>
      </div>
      {problem.text && <ProblemText id={problem.id}>{problem.text}</ProblemText>}
    </fieldset>
  );
}

function CallNode({ path, node }: { path: Path; node: Call }) {
  const { catalog, lang, tree, change } = useEditor();
  const rule = catalog.rules.find((item) => item.name === node.name);
  const problem = useProblems(path);
  const kwargs = Object.keys(node.kwargs);

  return (
    <fieldset
      aria-label={textIn(rule?.label, lang, node.name)}
      aria-describedby={problem.text ? problem.id : undefined}
      className={`flex flex-wrap items-center gap-2 rounded-[5px] ${problem.text ? "bg-danger-soft p-1" : ""}`}
    >
      <button
        type="button"
        aria-pressed={node.inverse}
        className="h-8 rounded-[5px] border border-rule-strong px-2 text-[0.8125rem] text-ink-muted transition-colors duration-150 hover:border-ink-muted aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:text-accent"
        onClick={() => change(toggleInverse(tree, path))}
      >
        {t(lang, "not")}
      </button>
      <span className="text-sm">
        {rule?.label ? textIn(rule.label, lang, node.name) : <Name mono>{node.name}</Name>}
      </span>
      {node.args.map((_, index) => (
        <ParamControl
          // biome-ignore lint/suspicious/noArrayIndexKey: positional arguments are their index
          key={index}
          path={[...path, "args", index]}
          param={rule?.args[index]}
        />
      ))}
      {kwargs.map((name) => (
        <ParamControl
          key={name}
          path={[...path, "kwargs", name]}
          param={rule?.kwargs.find((param) => param.name === name)}
          named
        />
      ))}
      <ItemTools path={path} />
      {problem.text && <ProblemText id={problem.id}>{problem.text}</ProblemText>}
    </fieldset>
  );
}

/** One argument: its choices as a select, a number or text input, or a checkbox. */
function ParamControl({
  path,
  param,
  named = false,
}: {
  path: Path;
  param: Param | undefined;
  named?: boolean;
}) {
  const { lang, tree, change } = useEditor();
  const value = at(tree, path) as Json;
  const problem = useProblems(path);
  const name = String(path[path.length - 1]);
  const label = textIn(param?.label, lang, name);
  const invalid = problem.text !== null || undefined;
  const set = (next: Json) => change(setAt(tree, path, next));
  const schema = param?.schema ?? {};
  const options =
    param?.choices ??
    (Array.isArray(schema.enum)
      ? schema.enum.map((item) => ({ value: item, label: undefined }))
      : null);
  let control: ReactNode;

  if (options) {
    // values may be numbers or strings: the option keeps the JSON of each
    control = (
      <select
        aria-label={label}
        aria-invalid={invalid}
        className={`${SMALL_INPUT} max-w-48`}
        value={JSON.stringify(value)}
        onChange={(e) => set(JSON.parse(e.target.value) as Json)}
      >
        {!options.some((option) => JSON.stringify(option.value) === JSON.stringify(value)) && (
          <option value={JSON.stringify(value)}>{String(value)}</option>
        )}
        {options.map((option) => (
          <option key={JSON.stringify(option.value)} value={JSON.stringify(option.value)}>
            {textIn(option.label, lang, String(option.value))}
          </option>
        ))}
      </select>
    );
  } else if (typeof value === "number") {
    control = (
      <NumberInput label={label} invalid={problem.text !== null} value={value} onChange={set} />
    );
  } else if (typeof value === "boolean") {
    control = (
      <input
        type="checkbox"
        aria-label={label}
        aria-invalid={invalid}
        className="size-4 accent-[var(--accent)]"
        checked={value}
        onChange={(e) => set(e.target.checked)}
      />
    );
  } else if (typeof value === "string") {
    control = (
      <input
        aria-label={label}
        aria-invalid={invalid}
        dir="auto"
        className={`${SMALL_INPUT} w-36`}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    );
  } else {
    // shortcut: lists and objects show as JSON only; edit them in the code view (Phase 5)
    control = (
      <code dir="ltr" className="rounded-[4px] bg-sunken px-1.5 py-1 font-mono text-xs">
        {JSON.stringify(value)}
      </code>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {named && <span className="text-[0.8125rem] text-ink-muted">{label}</span>}
      {control}
      {problem.text && <ProblemText id={problem.id}>{problem.text}</ProblemText>}
    </span>
  );
}
