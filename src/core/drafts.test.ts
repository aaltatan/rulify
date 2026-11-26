import { afterEach, describe, expect, it, vi } from "vitest";
import { clearDraft, loadDraft, saveDraft } from "./drafts.ts";

function memoryStorage(): Storage {
  const items = new Map<string, string>();

  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
    clear: () => items.clear(),
    key: () => null,
    get length() {
      return items.size;
    },
  };
}

describe("drafts", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("saves, loads and clears a draft", () => {
    vi.stubGlobal("localStorage", memoryStorage());

    expect(saveDraft({ "x-kind": "formula" }, 1)).toBe(true);
    expect(loadDraft()).toMatchObject({ schema: { "x-kind": "formula" }, definition: 1 });

    clearDraft();

    expect(loadDraft()).toBeNull();
  });

  it("never throws when storage is missing or full", () => {
    vi.stubGlobal("localStorage", undefined);

    expect(saveDraft({}, 1)).toBe(false);
    expect(loadDraft()).toBeNull();
    expect(() => clearDraft()).not.toThrow();

    vi.stubGlobal("localStorage", {
      ...memoryStorage(),
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    });

    expect(saveDraft({}, 1)).toBe(false);
  });

  it("ignores a stored draft that is not JSON", () => {
    const storage = memoryStorage();
    storage.setItem("rulify:draft", "{oops");
    vi.stubGlobal("localStorage", storage);

    expect(loadDraft()).toBeNull();
  });
});
