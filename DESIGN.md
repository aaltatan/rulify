---
name: rulify
description: "The family drafting sheet, here for business rules: cases on a rail, values built from a palette, the definition printed as a blueprint."
colors:
  accent: "oklch(0.47 0.16 260)"
  accent-hover: "oklch(0.41 0.16 260)"
  accent-soft: "oklch(0.93 0.035 258)"
  on-accent: "oklch(0.99 0.005 245)"
  paper: "oklch(0.962 0.008 245)"
  grid: "oklch(0.925 0.012 245)"
  sheet: "oklch(0.99 0.003 245)"
  sunken: "oklch(0.945 0.01 245)"
  rule: "oklch(0.87 0.012 245)"
  rule-strong: "oklch(0.74 0.018 250)"
  ink: "oklch(0.26 0.035 258)"
  ink-muted: "oklch(0.47 0.03 255)"
  danger: "oklch(0.52 0.19 27)"
  danger-soft: "oklch(0.95 0.03 27)"
  ok: "oklch(0.5 0.12 160)"
  print: "oklch(0.255 0.06 258)"
  print-rule: "oklch(0.34 0.06 258)"
  print-ink: "oklch(0.93 0.02 240)"
  accent-dark: "oklch(0.78 0.11 245)"
  accent-hover-dark: "oklch(0.84 0.09 245)"
  accent-soft-dark: "oklch(0.33 0.07 255)"
  on-accent-dark: "oklch(0.2 0.04 258)"
  paper-dark: "oklch(0.205 0.035 258)"
  grid-dark: "oklch(0.235 0.04 258)"
  sheet-dark: "oklch(0.245 0.04 258)"
  sunken-dark: "oklch(0.215 0.038 258)"
  rule-dark: "oklch(0.33 0.04 258)"
  rule-strong-dark: "oklch(0.45 0.045 255)"
  ink-dark: "oklch(0.94 0.012 245)"
  ink-muted-dark: "oklch(0.74 0.03 248)"
  danger-dark: "oklch(0.74 0.15 25)"
  danger-soft-dark: "oklch(0.3 0.06 25)"
  ok-dark: "oklch(0.78 0.12 160)"
  print-dark: "oklch(0.165 0.035 258)"
  print-rule-dark: "oklch(0.28 0.04 258)"
  print-ink-dark: "oklch(0.92 0.02 240)"
typography:
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.025em"
  wordmark:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    letterSpacing: "-0.02em"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  button:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
  caption:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
  code-block:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.625
  sentence:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: "2.75rem"
rounded:
  xs: "3px"
  sm: "4px"
  md: "5px"
  lg: "6px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  logo-mark:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.lg}"
    size: "28px"
  segmented:
    backgroundColor: "{colors.sunken}"
    rounded: "{rounded.lg}"
    padding: "2px"
  segmented-selected:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    height: "28px"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "36px"
  button-add:
    textColor: "{colors.ink-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  button-add-hover:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
  button-icon:
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
    size: "32px"
  rail-case:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  rail-case-number:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    size: "24px"
  rail-otherwise:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  group-bracket:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    padding: "0 0 0 12px"
  value-node:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
    height: "32px"
  value-node-target:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  value-node-error:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  palette:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px"
  palette-piece:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "28px"
  palette-operator:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    size: "32px"
  sentence-word:
    textColor: "{colors.ink}"
    typography: "{typography.sentence}"
    rounded: "{rounded.sm}"
    padding: "0 4px"
  tree-node:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  tree-node-result:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  reads-as:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  schema-drop:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "32px"
  panel-print:
    backgroundColor: "{colors.print}"
    textColor: "{colors.print-ink}"
    typography: "{typography.code-block}"
    rounded: "{rounded.lg}"
    padding: "16px"
  panel-print-tab-selected:
    backgroundColor: "{colors.print-rule}"
    textColor: "{colors.print-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    height: "28px"
  button-print-download:
    backgroundColor: "{colors.print-ink}"
    textColor: "{colors.print}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "32px"
---

# Design System: rulify

## Overview

**Creative North Star: "The Drafting Sheet, for rules"**

rulify is schemify's sibling and lives in the same world: cool blue-grey paper with a faint
24px graph grid, clean sheets ruled with 1px hairlines and lifted by the softest navy-tinted
shadow, one ink-blue pen for everything live, and the output printed beside the sheet as a
navy blueprint. Tokens, shadows, corners and the named rules below are schemify's, unchanged;
this document adds what rulify draws that schemify does not.

What rulify draws is a rule people read before they run it. A ruleset is a line of numbered
cases down a **rail**, tried in order, closed by "otherwise". A condition is a sentence of rule
calls held by brackets ("all of", "any of"). A value is a row of small **value nodes**: numbers,
variables, an operation written between its terms, a function boxed around its value, or a
whole ruleset nested inside. Under the sheet, the **Reads as** line prints what Python will
print; beside it, the blueprint prints the definition JSON and the same rule as Python code.

Arabic comes first: the page is `dir="rtl"` by default, every layout uses logical sides, and
the rail runs down the start edge, which is the right in Arabic and the left in English.

Density is a working tool's: 36px controls, 13-15px text, 12-16px gaps.

**Key Characteristics:**
- schemify's paper, grid, rules, corners, shadows and single ink-blue accent, unchanged.
- Cases on a rail at the start edge; "otherwise" closes it as a recessed sheet.
- Values as small recessed nodes in a row; the palette fills the node marked with a dashed ink outline.
- Kinds (ruleset, condition, formula) are told apart by words and shape, never by colour.
- Formulas, code and names from the schema are wrapped in `<bdi dir="ltr">` inside Arabic text.

## Colors

The palette is schemify's (see the frontmatter), with the same roles: Drafting Paper and Graph
Line behind everything, Clean Sheet for cards and controls, Recess for nested and result parts,
Hairline and Strong Rule for edges, Graphite Ink and Graphite Muted for text, Drafting Ink Blue
for interaction, Correction Red for errors, Check Green for the valid state, and the Blueprint
trio for the output panel. The `-dark` tokens are the same roles under dark mode.

rulify's added uses:
- **Ink Wash** (accent-soft) fills the value node the palette will fill, behind its dashed accent outline.
- **Recess** (sunken) is the ground of value nodes, the "otherwise" case, tree result nodes and the Reads as line.
- **Correction Wash** (danger-soft) fills a value node or case whose JSON path carries an error.

### Named Rules
**The One Ink Rule** (schemify's). The accent marks only what is live: focus, the palette's
target, the selected look and root kind, checked and pressed controls, add-on-hover. Kinds,
operators and cases never get their own colours.

**The Correction Red Rule** (schemify's). Red sits only on the node, case or field whose JSON
path carries an error, and on remove-on-hover.

**The Blueprint Print Rule** (schemify's). The JSON and Python output are navy with pale ink in
both themes.

## Typography

**Body Font:** system sans (ui-sans-serif, system-ui, sans-serif); on Windows this is Segoe UI,
which carries Arabic. No web font is loaded.
**Mono Font:** system mono, for data only.

### Hierarchy
schemify's scale (Title, Wordmark, Body, Button, Label, Caption, Code, Code Block), plus:
- **Sentence** (400, 0.9375rem, line height 2.75rem): the sentence look, where controls sit inline in the running text and need the tall line.

### Arabic
- Arabic body text takes line height 1.6 or more; the tight Latin values apply to Latin only.
- No letter-spacing on Arabic text: tracking breaks the joined script. The wordmark's -0.02em applies to the Latin wordmark only.
- Arabic is never set in mono and never in italics.

### Named Rules
**The Mono Means Data Rule** (schemify's). Mono is for rule names, variable names, operator
symbols, the Reads as line, JSON and Python. A rule or variable shown by its label (`x-label`)
is a word, set in sans.

**The Question Label Rule** (schemify's). Labels are plain sentence-case words in muted ink,
never uppercase, never letter-spaced.

## Layout

schemify's frame: a centred container (max 80rem), a sticky 56px header and a 40px footer bar.
Below 1024px everything stacks; from 1024px the main area splits into a fluid sheet column and
a 30rem blueprint column with a 32px gap, the blueprint sticky beside the sheet. All sides are
logical (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`); the blueprint sits at the end side.

The sheet column holds, in order: the root-kind and look switches on one row, the editor, then
the Reads as line. In the rail look, from 1280px the palette takes a 16rem column at the start
side of the sheet, sticky; below that it folds into a row above the editor.

Spacing rhythm: 6px label to control, 8px between value nodes, 12px between fields and inside
cases, 16px case padding, 24px and 32px between columns. The 24px grid sets the measure.

## Elevation & Depth

schemify's vocabulary, unchanged: Sheet shadow on rail cases and tree nodes, Popover on lists,
Print on the blueprint, Mark on the brand tile, Focus Halo on inputs. Value nodes and the
"otherwise" case are recessed (sunken fill, no shadow): they sit in the sheet, not on it.

## Shapes

schemify's corners: 5px controls and value nodes, 6px containers (cases, palette, tree nodes,
blueprint), 4px small inner parts. Round shapes appear only on the case number badge and the
status dot. Borders are 1px; dashed strong rules mark empty slots (an add button, an empty
group, the schema drop area), and a dashed accent rule marks the palette's target.

## Components

### Header
schemify's header: brand lockup ("rulify" wordmark after the mark), then at the end side a
language switch (ع / EN) and the theme switch, both segmented controls.

### Segmented switches
A recessed 6px track with 2px padding and 28px segments; the selected segment takes the ink
wash and accent text. Used for the root kind (ruleset, condition, formula), the look (rail,
sentence, tree, code), the language, the theme, a group's "all of / any of", and the
blueprint's JSON / Python tabs (in the blueprint's own colours).

### Schema drop area
Before a schema is open, the sheet column shows one large clean sheet with a 1px dashed strong
rule and 32px padding: a sentence saying what to drop, a "Choose file" button and a paste box.
On drag-over the dash turns accent and the fill turns ink wash. A file that is not a rulify
schema gets a red sentence under the area saying why, in plain words.

### Rail (signature)
The ruleset look. A 1px strong rule runs down the start edge; each case is a clean sheet hung
off it with a 24px round number badge sitting on the rule (sheet fill, strong-rule border,
muted caption numerals). A case reads "if" and its condition, then "then" and its value, with
its optional label as a small input at the top. Cases fold to one sentence (their Reads as
text) and reorder by drag or by move buttons; the order is the order Python tries them. The
rail ends in the "otherwise" case: a recessed sheet with no number, the line stopping at it.
An "Add a case" dashed button sits on the rail before "otherwise".

### Condition groups
A group draws as a bracket: a 1px strong rule along the start edge with 12px padding, its
"all of / any of" switch at the top. Each item is a row: the rule's label, its argument
controls (choices from `x-choices` as a select, numbers and text as inputs), a "not" toggle,
and a remove icon button. A nested group is a bracket inside the bracket. An empty group
shows a dashed strong-rule slot.

### Value nodes
A formula is a row of 32px-tall recessed nodes with 5px corners, 8px apart, wrapping as text
wraps. A number is an input; a variable shows its label; an operation writes its symbol
(mono, muted) between its terms; a function boxes its value with its name before it; `round`
adds its digits input; a nested ruleset ("by condition") opens a small rail inside the node.
The node the palette fills has a 1px dashed accent outline and an ink-wash fill. A node with
an error takes the correction wash and red border, its message directly under it.

### Palette
A clean sheet (12px padding) with shelves under muted label headings: Variables (28px pieces
with their labels, filtered by a search input), Operations (32px squares with the mono
symbol, named in the tooltip), Functions (28px pieces with their names), and "By condition".
Pressing a piece fills the target node: a variable replaces it; an operation, a function or a
condition takes it inside. Only what the schema allows appears.

### Sentence look
The same definition as running sentences in the Sentence type: "If … then …", "Else if …",
"Otherwise …", the structural words in semibold ink, every changeable word a button with a
dotted strong-rule underline that opens its list in place. Hover gives the case a recessed fill.

### Tree look
A decision tree drawn with borders, not a canvas: a Start node, a strong-rule trunk at the
start edge, one branch per case to its condition node (sheet) and on, along a dashed stub, to
its value node (recess); "otherwise" last. Each node shows a heading (number, "if" / "else
if", the label) and its Reads as text. A pressed node takes the accent border and opens its
editor under the drawing. A node whose path carries an error takes the red border.

### Code view
The definition JSON in an editable mono area on the sheet; it accepts only text that parses
and validates, and shows the first error's path and message under it until then.

### Reads as
A recessed strip under the editor: the muted label "Reads as", then the text Python prints for
this definition, in mono inside `<bdi dir="ltr">`. It always equals the golden cases.

### Blueprint Panel (signature, schemify's)
The output as a print: navy ground, pale ink, 1px blueprint-rule border, 6px corners, Print
shadow. The toolbar holds the status dot (green when valid, red with the error count), JSON /
Python tabs, Copy (ghost) and Download (solid blueprint ink). The body is the JSON or the
Python code in Code Block mono, left to right in both languages.

### Brand Mark
A 28px accent tile with 6px corners and the Mark shadow, carrying the on-accent line drawing at
stroke 2: three ruled lines of falling length with a dot before each, a short list of rules.
The favicon is the same drawing on a 32px tile.

### Icons
schemify's: authored 24px line icons at 1.75 stroke, drawn at 16px in currentColor.
Direction-bearing icons (arrows, chevrons) mirror in RTL; move up / move down do not.

## Do's and Don'ts

### Do:
- **Do** use schemify's tokens through the theme's custom properties, in both themes.
- **Do** run the rail down the start edge and use logical sides everywhere.
- **Do** wrap formulas, rule and variable names, Reads as text and code in `<bdi dir="ltr">`.
- **Do** show schema labels in the chosen language, falling back to the name in mono.
- **Do** put each error on the node, case or field its JSON path names.
- **Do** keep the order of cases visible: numbers on the rail, "otherwise" last.

### Don't:
- **Don't** give kinds, operators or cases their own colours; the accent marks only what is live.
- **Don't** letter-space or italicise Arabic, or set it in mono.
- **Don't** use left/right classes or physical margins.
- **Don't** draw the tree with a canvas or diagram library; borders keep it readable in order.
- **Don't** parse typed text into a tree outside the code view.
- **Don't** use glyph or emoji icons, pill-shaped controls, hard shadows or a second accent.
