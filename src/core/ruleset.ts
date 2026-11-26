// Ruleset operations: branches tried in order, then `otherwise`. `path` points at the ruleset
// body: `[]` for a ruleset root, `[..., "when"]` for a `when` node inside a formula.
import { emptyGroup } from "./predicate.ts";
import { at, type Json, type Path, setAt } from "./tree.ts";

export type Branch = { when: Json; then: Json; label?: string };
export type Ruleset = { branches: Branch[]; otherwise: Json };

export function emptyRuleset(): Ruleset {
  return { branches: [], otherwise: 0 };
}

function branchesAt(tree: Json, path: Path): Branch[] {
  return ((at(tree, path) as Ruleset).branches ?? []) as Branch[];
}

function withBranches(tree: Json, path: Path, branches: Branch[]): Json {
  return setAt(tree, [...path, "branches"], branches as Json);
}

export function addBranch(tree: Json, path: Path): Json {
  return withBranches(tree, path, [
    ...branchesAt(tree, path),
    { when: emptyGroup() as Json, then: 0 },
  ]);
}

export function removeBranch(tree: Json, path: Path, index: number): Json {
  return withBranches(
    tree,
    path,
    branchesAt(tree, path).filter((_, i) => i !== index),
  );
}

/** The branch at `from` moved to `to` (branches are tried in order); unchanged out of range. */
export function moveBranch(tree: Json, path: Path, from: number, to: number): Json {
  const branches = [...branchesAt(tree, path)];

  if (to < 0 || to >= branches.length || from === to) return tree;

  const [moved] = branches.splice(from, 1);
  branches.splice(to, 0, moved as Branch);

  return withBranches(tree, path, branches);
}

/** The branch's label set, or removed when blank (a label is optional). */
export function setLabel(tree: Json, path: Path, index: number, label: string): Json {
  const branches = branchesAt(tree, path).map((branch, i) => {
    if (i !== index) return branch;

    const { label: _, ...rest } = branch;

    return label.trim() ? { ...rest, label } : rest;
  });

  return withBranches(tree, path, branches);
}
