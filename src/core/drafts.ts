// Drafts in localStorage. Storage can be missing, full or blocked (private mode, quota), so
// every call is guarded: a failed save loses the draft, never the page.

export type Draft = { schema: unknown; definition: unknown; savedAt: string };

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
export function saveDraft(schema: unknown, definition: unknown): boolean {
  try {
    const draft: Draft = { schema, definition, savedAt: new Date().toISOString() };
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
