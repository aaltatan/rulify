// What the three kinds of definition share: JSON paths into the tree, read and replace.

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
/** Keys and indexes from the root down to a node: `["branches", 0, "when"]`; `[]` is the root. */
export type Path = readonly (string | number)[];

export function at(tree: Json, path: Path): Json | undefined {
  let node: Json | undefined = tree;

  for (const step of path) {
    node =
      node !== null && typeof node === "object" ? (node as Record<string, Json>)[step] : undefined;
  }

  return node;
}

/** The tree with the value at `path` replaced; the input is not changed. */
export function setAt(tree: Json, path: Path, value: Json): Json {
  if (path.length === 0) return value;

  const [step, ...rest] = path as [string | number, ...(string | number)[]];

  if (Array.isArray(tree))
    return tree.map((child, i) => (i === step ? setAt(child, rest, value) : child));

  const object = tree as Record<string, Json>;

  return { ...object, [step]: setAt(object[step] ?? null, rest, value) };
}

/** A path as the libraries write it in errors: `["branches", 0, "when"]` -> `$.branches[0].when`. */
export function pathKey(path: Path): string {
  return `$${path.map((step) => (typeof step === "number" ? `[${step}]` : `.${step}`)).join("")}`;
}
