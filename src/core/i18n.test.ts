import { describe, expect, it } from "vitest";
import { dirOf, t, textIn } from "./i18n.ts";

describe("i18n", () => {
  it("picks a schema text in the language, then English, then any, then the name", () => {
    expect(textIn({ ar: "الراتب", en: "Salary" }, "ar", "salary")).toBe("الراتب");
    expect(textIn({ en: "Salary" }, "ar", "salary")).toBe("Salary");
    expect(textIn({ fr: "Salaire" }, "ar", "salary")).toBe("Salaire");
    expect(textIn("Salary", "ar", "salary")).toBe("Salary");
    expect(textIn(undefined, "ar", "salary")).toBe("salary");
  });

  it("has rulify's own words in both languages", () => {
    expect(t("en", "otherwise")).toBe("Otherwise");
    expect(t("ar", "multiply")).toBe("ضرب");
    expect(t("ar", "lgamma")).toBe("lgamma");
    expect([dirOf("ar"), dirOf("en")]).toEqual(["rtl", "ltr"]);
  });
});
