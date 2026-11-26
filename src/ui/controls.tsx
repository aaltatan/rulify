// The controls every look shares (schemify's classes): native inputs and selects, so they work
// from the keyboard and read right to a screen reader with no extra dependency.
import { type ReactNode, useEffect, useId, useState } from "react";

export const INPUT =
  "h-9 rounded-[5px] border border-rule-strong bg-sheet px-2.5 text-sm text-ink placeholder:text-ink-muted/70 transition-[border-color,box-shadow] duration-150 hover:border-ink-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] focus:outline-none aria-invalid:border-danger aria-invalid:focus:shadow-[0_0_0_3px_var(--danger-soft)]";

export const SMALL_INPUT = `${INPUT} h-8 px-2`;

export const ICON_BUTTON =
  "grid size-8 shrink-0 place-items-center rounded-[5px] text-ink-muted transition-colors duration-150 hover:bg-sunken hover:text-ink disabled:pointer-events-none disabled:opacity-30";

export const REMOVE_BUTTON = `${ICON_BUTTON} hover:bg-danger-soft hover:text-danger`;

export const BUTTON =
  "inline-flex h-9 items-center gap-1.5 rounded-[5px] px-3 text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40";

export const ADD_BUTTON = `${BUTTON} self-start border border-dashed border-rule-strong text-ink-muted hover:border-accent hover:bg-accent-soft hover:text-accent`;

export const GHOST_BUTTON = `${BUTTON} border border-rule-strong bg-sheet text-ink hover:border-ink-muted`;

export const SHEET =
  "rounded-[6px] border border-rule bg-sheet shadow-[0_1px_2px_oklch(0.2_0.05_258/0.06)]";

// -----------------------
// icons, one stroke weight
// -----------------------

const PATHS = {
  up: "M12 19V5M6 11l6-6 6 6",
  down: "M12 5v14M6 13l6 6 6-6",
  x: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  upload: "M12 16V4M7 9l5-5 5 5M5 20h14",
  group: "M8 4H5v16h3M16 4h3v16h-3",
  check: "M5 12.5l4.5 4.5L19 7.5",
  copy: "M9 9h10v10H9zM5 15V5h10",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
} as const;

export function Icon({
  name,
  className = "size-4",
}: {
  name: keyof typeof PATHS;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/** The mark: three ruled lines of falling length, a dot before each (also the favicon). */
export function Logo() {
  return (
    <span className="grid size-7 place-items-center rounded-[6px] bg-accent text-on-accent shadow-[0_1px_2px_oklch(0.2_0.06_258/0.3)]">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        className="size-[1.125rem]"
        aria-hidden="true"
      >
        <path d="M11 8h10M11 16h14M11 24h12M6 8h.01M6 16h.01M6 24h.01" />
      </svg>
    </span>
  );
}

// -----------------------
// segmented switch
// -----------------------

/** A row of radio buttons drawn as segments: the root kind, the language, all of / any of. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
}) {
  const name = useId();

  return (
    <fieldset
      aria-label={label}
      className="inline-flex shrink-0 rounded-[6px] border border-rule bg-sunken p-0.5"
    >
      {options.map(([option, text]) => (
        <label key={option} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            className="peer sr-only"
            checked={option === value}
            onChange={() => onChange(option)}
          />
          <span className="grid h-7 place-items-center rounded-[4px] px-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:text-ink peer-checked:bg-accent-soft peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
            {text}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

// -----------------------
// number input
// -----------------------

/**
 * A number typed as text: the tree takes it once it reads as a number, so "1." or "-" can be
 * typed on the way. The number is kept as typed; nothing is rounded.
 */
export function NumberInput({
  value,
  label,
  invalid = false,
  className = "w-24",
  onChange,
}: {
  value: number;
  label: string;
  invalid?: boolean;
  className?: string;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState(String(value));

  // a change from elsewhere (the palette, a loaded file) replaces what was typed
  useEffect(() => {
    setText((typed) => (Number(typed) === value && typed.trim() !== "" ? typed : String(value)));
  }, [value]);

  return (
    <input
      inputMode="decimal"
      dir="ltr"
      aria-label={label}
      aria-invalid={invalid || undefined}
      className={`${SMALL_INPUT} font-mono ${className}`}
      value={text}
      onChange={(e) => {
        const typed = e.target.value;
        setText(typed);

        if (typed.trim() !== "" && Number.isFinite(Number(typed))) onChange(Number(typed));
      }}
    />
  );
}

// -----------------------
// problems
// -----------------------

export function ProblemText({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="basis-full text-xs text-danger">
      {children}
    </p>
  );
}
