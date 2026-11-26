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
  and: { ar: "و", en: "and" },
  or: { ar: "أو", en: "or" },
  // the looks
  look: { ar: "الشكل", en: "Look" },
  rail: { ar: "قائمة", en: "Rail" },
  sentence: { ar: "جمل", en: "Sentence" },
  tree: { ar: "شجرة", en: "Tree" },
  start: { ar: "البداية", en: "Start" },
  theValue: { ar: "القيمة", en: "The value" },
  close: { ar: "أغلق", en: "Close" },
  // the shell, the rail and the palette
  kind: { ar: "ما تبنيه", en: "What you build" },
  language: { ar: "اللغة", en: "Language" },
  openSchema: { ar: "افتح مخططًا", en: "Open a schema" },
  dropSchema: {
    ar: "أفلت ملف المخطط هنا، أو اختره، أو الصقه في المربع.",
    en: "Drop the schema file here, choose it, or paste it in the box.",
  },
  chooseFile: { ar: "اختر ملفًا", en: "Choose file" },
  pasteSchema: { ar: "الصق المخطط (JSON)", en: "Paste the schema (JSON)" },
  open: { ar: "افتح", en: "Open" },
  trySample: { ar: "جرّب مثال الرواتب", en: "Try the payroll sample" },
  notJson: { ar: "هذا النص ليس JSON صالحًا.", en: "This text is not valid JSON." },
  notRulify: {
    ar: "هذا ليس مخطط rulify: لا يذكر الجذر نوعه (x-kind).",
    en: "This is not a rulify schema: its root does not say its kind (x-kind).",
  },
  badSchema: { ar: "تعذّر قراءة هذا المخطط:", en: "This schema could not be read:" },
  otherSchema: { ar: "مخطط آخر", en: "Another schema" },
  openDefinition: { ar: "افتح تعريفًا", en: "Open a definition" },
  definitionRefused: {
    ar: "لا يطابق هذا التعريف المخطط:",
    en: "This definition does not match the schema:",
  },
  addCase: { ar: "أضف حالة", en: "Add a case" },
  caseLabel: { ar: "اسم الحالة (اختياري)", en: "Name of the case (optional)" },
  case: { ar: "الحالة", en: "Case" },
  moveUp: { ar: "انقل للأعلى", en: "Move up" },
  moveDown: { ar: "انقل للأسفل", en: "Move down" },
  remove: { ar: "احذف", en: "Remove" },
  addCondition: { ar: "أضف شرطًا…", en: "Add a condition…" },
  addGroup: { ar: "أضف مجموعة", en: "Add a group" },
  noConditions: { ar: "لا شروط بعد: تصح دائمًا.", en: "No conditions yet: always true." },
  // an empty "any of" group is false, as pyspecification folds it from `false`
  noConditionsAny: { ar: "لا شروط بعد: لا تصح أبدًا.", en: "No conditions yet: never true." },
  never: { ar: "أبدًا", en: "Never" },
  addTerm: { ar: "أضف حدًا", en: "Add a term" },
  decimals: { ar: "المنازل العشرية", en: "Decimal places" },
  number: { ar: "رقم", en: "Number" },
  variable: { ar: "متغير", en: "Variable" },
  variables: { ar: "المتغيرات", en: "Variables" },
  operations: { ar: "العمليات", en: "Operations" },
  functions: { ar: "الدوال", en: "Functions" },
  search: { ar: "ابحث", en: "Search" },
  paletteHint: {
    ar: "اختر قيمة، ثم اضغط قطعة لتضعها فيها.",
    en: "Choose a value, then press a piece to put it there.",
  },
  insert: { ar: "أدرج", en: "Insert" },
  problems: { ar: "مشكلات", en: "Problems" },
  valid: { ar: "صالح", en: "Valid" },
  definition: { ar: "التعريف", en: "Definition" },
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

/** A validation problem in `lang`: rulify's sentence for its keyword, else Ajv's English. */
export function problemText(lang: Lang, keyword: string, message: string): string {
  return keyword in WORDS ? t(lang, keyword) : message;
}
