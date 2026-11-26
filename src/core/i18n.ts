// The two languages: the words rulify shows itself, and the schema's texts (`x-label`,
// `x-description`, a choice's label), which are one string or one per language.

export type Lang = "ar" | "en";
export type Text = string | Readonly<Record<string, string>>;

export const LANGS: readonly Lang[] = ["ar", "en"];

export function dirOf(lang: Lang): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}

/** A schema text in `lang`: its own entry, else English, else any entry, else `fallback`. */
export function textIn(text: Text | undefined, lang: Lang, fallback: string): string {
  if (typeof text === "string") return text;

  if (!text) return fallback;

  return text[lang] ?? text.en ?? Object.values(text)[0] ?? fallback;
}

const WORDS = {
  ruleset: { ar: "قواعد", en: "Ruleset" },
  predicate: { ar: "شرط", en: "Condition" },
  formula: { ar: "قيمة", en: "Formula" },
  if: { ar: "إذا", en: "If" },
  elseIf: { ar: "وإلا إذا", en: "Else if" },
  then: { ar: "فالقيمة", en: "Then" },
  otherwise: { ar: "وإلا", en: "Otherwise" },
  always: { ar: "دائمًا", en: "Always" },
  not: { ar: "ليس", en: "Not" },
  all: { ar: "كل ما يلي", en: "All of" },
  any: { ar: "أي مما يلي", en: "Any of" },
  readsAs: { ar: "تُقرأ", en: "Reads as" },
  byCondition: { ar: "حسب الشرط", en: "By condition" },
  // formula operators and functions: the libraries do not label them
  add: { ar: "زائد", en: "Plus" },
  subtract: { ar: "ناقص", en: "Minus" },
  multiply: { ar: "ضرب", en: "Times" },
  divide: { ar: "قسمة", en: "Divided by" },
  modulo: { ar: "باقي القسمة", en: "Remainder" },
  floor_divide: { ar: "قسمة صحيحة", en: "Whole division" },
  power: { ar: "أس", en: "To the power" },
  round: { ar: "تقريب", en: "Round" },
  floor: { ar: "تقريب للأدنى", en: "Round down" },
  ceil: { ar: "تقريب للأعلى", en: "Round up" },
  trunc: { ar: "الجزء الصحيح", en: "Whole part" },
  absolute: { ar: "القيمة المطلقة", en: "Absolute value" },
  negative: { ar: "سالب", en: "Negative" },
  positive: { ar: "موجب", en: "Positive" },
  sqrt: { ar: "الجذر التربيعي", en: "Square root" },
  // validation, by Ajv keyword
  invalid: { ar: "هذه القيمة غير مسموحة هنا.", en: "This value is not allowed here." },
  required: { ar: "ينقص جزء مطلوب.", en: "A required part is missing." },
  type: { ar: "نوع القيمة غير صحيح.", en: "This value has the wrong type." },
  enum: { ar: "اختر من القائمة.", en: "Choose from the list." },
  minItems: { ar: "يلزم عنصر واحد على الأقل.", en: "At least one item is needed." },
} as const satisfies Record<string, Record<Lang, string>>;

export type Word = keyof typeof WORDS;

/** rulify's own word for `key`; an unknown key (a function nobody named yet) is returned as is. */
export function t(lang: Lang, key: string): string {
  return key in WORDS ? WORDS[key as Word][lang] : key;
}
