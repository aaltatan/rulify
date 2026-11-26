// Drafts in localStorage. Storage can be missing, full or blocked (private mode, quota), so
// every call is guarded: a failed save loses the draft, never the page.

import type { Lang } from "./i18n.ts";
import { type Kind, readSchema, subschemas } from "./reader.ts";
import type { Json } from "./tree.ts";
import { makeValidator } from "./validate.ts";

export type Draft = { schema: unknown; kind: Kind; definition: unknown; savedAt: string };
export type Restored = { schema: unknown; kind: Kind; definition: Json };

const KEY = "rulify:draft";

export function loadDraft(): Draft | null {
  try {
    const text = globalThis.localStorage?.getItem(KEY);

    return text ? (JSON.parse(text) as Draft) : null;
  } catch {
    return null;
  }
}

/** Whether the draft was saved. */
export function saveDraft(schema: unknown, kind: Kind, definition: unknown): boolean {
  try {
    const draft: Draft = { schema, kind, definition, savedAt: new Date().toISOString() };
    globalThis.localStorage.setItem(KEY, JSON.stringify(draft));

    return true;
  } catch {
    return false;
  }
}

export function clearDraft(): void {
  try {
    globalThis.localStorage?.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}

/**
 * A stored draft the editor can open again: its schema reads, has the kind, and the definition
 * is of that kind. Problems inside it are kept (work in progress); one on the root is not.
 */
export function restoreDraft(draft: Draft | null): Restored | null {
  try {
    if (!draft) return null;

    readSchema(draft.schema);

    const part = subschemas(draft.schema)[draft.kind];

    if (!part || draft.definition === undefined) return null;

    const definition = draft.definition as Json;

    // shortcut: a draft broken by hand below the root may still fail to draw; drafts are ours
    if ("$" in makeValidator(part)(definition)) return null;

    return { schema: draft.schema, kind: draft.kind, definition };
  } catch {
    return null;
  }
}

const LANG_KEY = "rulify:lang";

/** The language chosen last; Arabic when none was, or storage is blocked. */
export function loadLang(): Lang {
  try {
    return globalThis.localStorage?.getItem(LANG_KEY) === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}

export function saveLang(lang: Lang): void {
  try {
    globalThis.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // the choice lasts for this visit only
  }
}
