import { afterEach, describe, expect, it, vi } from "vitest";
import cases from "./cases.json";
import {
  clearDraft,
  type Draft,
  loadDraft,
  loadLang,
  restoreDraft,
  saveDraft,
  saveLang,
} from "./drafts.ts";

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

    expect(saveDraft({ "x-kind": "formula" }, "formula", 1)).toBe(true);
    expect(loadDraft()).toMatchObject({
      schema: { "x-kind": "formula" },
      kind: "formula",
      definition: 1,
    });

    clearDraft();

    expect(loadDraft()).toBeNull();
  });

  it("never throws when storage is missing or full", () => {
    vi.stubGlobal("localStorage", undefined);

    expect(saveDraft({}, "formula", 1)).toBe(false);
    expect(loadDraft()).toBeNull();
    expect(() => clearDraft()).not.toThrow();

    vi.stubGlobal("localStorage", {
      ...memoryStorage(),
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    });

    expect(saveDraft({}, "formula", 1)).toBe(false);
  });

  it("remembers the language, Arabic by default", () => {
    vi.stubGlobal("localStorage", memoryStorage());

    expect(loadLang()).toBe("ar");

    saveLang("en");

    expect(loadLang()).toBe("en");

    vi.stubGlobal("localStorage", undefined);

    expect(loadLang()).toBe("ar");
    expect(() => saveLang("en")).not.toThrow();
  });

  it("ignores a stored draft that is not JSON", () => {
    const storage = memoryStorage();
    storage.setItem("rulify:draft", "{oops");
    vi.stubGlobal("localStorage", storage);

    expect(loadDraft()).toBeNull();
  });
});

describe("restoreDraft", () => {
  const schema = cases.schemas["payroll-ruleset"];
  const draft = (kind: Draft["kind"], definition: unknown): Draft => ({
    schema,
    kind,
    definition,
    savedAt: "",
  });

  it("opens a draft whose definition is of its kind, problems inside kept", () => {
    expect(restoreDraft(draft("formula", "salary"))).toEqual({
      schema,
      kind: "formula",
      definition: "salary",
    });
    expect(restoreDraft(draft("formula", { round: "salary", ndigits: 2.5 }))).not.toBeNull();
  });

  it("refuses a draft of the wrong kind, a kind the schema lacks, or no schema", () => {
    expect(restoreDraft(draft("ruleset", "salary"))).toBeNull();
    expect(
      restoreDraft({ ...draft("formula", 1), schema: cases.schemas["payroll-predicate"] }),
    ).toBeNull();
    expect(restoreDraft({ ...draft("formula", 1), schema: { type: "object" } })).toBeNull();
    expect(restoreDraft(null)).toBeNull();
  });
});
