"use client";

import { useId } from "react";

/** Shared form pieces for the listing flow. One look for every field (consistency, Nielsen 4). */

export const inputCls = (invalid?: boolean) =>
  `w-full rounded-xl border bg-frost px-4 py-3 text-base text-ink placeholder:text-ink/40 transition-colors focus:outline-none focus:ring-2 ${
    invalid ? "border-crack focus:ring-crack/30" : "border-ink/20 hover:border-ink/40 focus:border-deep focus:ring-deep/30"
  }`;

export function Field({
  label,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: (p: { id: string; "aria-invalid": boolean; "aria-describedby": string | undefined }) => React.ReactNode;
}) {
  const id = useId();
  const descId = error || hint ? `${id}-d` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-medium">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-ink/60">Optional</span>}
      </label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": descId })}
      {error ? (
        <p id={descId} className="mt-1.5 flex items-start gap-1.5 text-sm text-crack">
          <ErrorGlyph />
          {error}
        </p>
      ) : (
        hint && (
          <p id={descId} className="mt-1.5 text-sm text-ink/65">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function ErrorGlyph() {
  return (
    <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5v5.5M12 16.5v.01" />
    </svg>
  );
}

/** Legend + chip group. `multiple` gives checkboxes, otherwise radios. */
export function ChipGroup({
  legend,
  options,
  value,
  onChange,
  multiple,
  error,
  hint,
  columns = "sm:grid-cols-3",
  invalidId,
}: {
  legend: string;
  options: { value: string; label: string; hint?: string }[];
  value: string | string[];
  onChange: (v: string) => void;
  multiple?: boolean;
  error?: string;
  hint?: string;
  columns?: string;
  invalidId?: string;
}) {
  const sel = (v: string) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <fieldset aria-invalid={!!error} id={invalidId}>
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div role={multiple ? "group" : "radiogroup"} aria-label={legend} className={`grid grid-cols-2 gap-2 ${columns}`}>
        {options.map((o) => {
          const on = sel(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role={multiple ? "checkbox" : "radio"}
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={`flex min-h-[3rem] flex-col items-start justify-center rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                on
                  ? "border-deep bg-deep/10 text-ink ring-1 ring-deep"
                  : error
                    ? "border-crack/50 hover:border-ink/50"
                    : "border-ink/20 hover:border-ink/45 hover:bg-ink/5"
              }`}
            >
              <span className="flex w-full items-center justify-between gap-2 text-[0.95rem] font-medium">
                {o.label}
                {on && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-deep" aria-hidden>
                    <path d="M5 12.5l4.2 4.2L19 7" />
                  </svg>
                )}
              </span>
              {o.hint && <span className="mt-0.5 text-xs leading-snug text-ink/65">{o.hint}</span>}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-crack">
          <ErrorGlyph />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-sm text-ink/65">{hint}</p>
      )}
    </fieldset>
  );
}

/** Inline message box. `error` is announced immediately, the others politely. */
export function Callout({
  kind = "info",
  title,
  children,
  action,
}: {
  kind?: "info" | "success" | "warn" | "error";
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const tone =
    kind === "error"
      ? "border-crack/50 bg-crack/10"
      : kind === "warn"
        ? "border-reed/70 bg-reed/20"
        : kind === "success"
          ? "border-deep/40 bg-deep/10"
          : "border-ink/15 bg-ink/5";
  const icon =
    kind === "success" ? "M5 12.5l4.2 4.2L19 7" : kind === "info" ? "M12 11v5.5M12 7.5v.01" : "M12 7v6M12 16.5v.01";
  const iconTone = kind === "error" ? "text-crack" : kind === "success" ? "text-deep" : "text-ink";
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-2xl border p-4 ${tone}`}>
      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current ${iconTone}`} aria-hidden>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.95rem] font-semibold leading-snug">{title}</p>
        {children && <div className="mt-1 text-sm leading-relaxed text-ink/80">{children}</div>}
        {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}

/** Same bar used by the page progress, the NADRA check, the hardware test and publishing. */
export function ProgressBar({ value, label, slow }: { value: number; label: string; slow?: boolean }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className="h-2 overflow-hidden rounded-full bg-ink/10"
    >
      <div
        className={`h-full rounded-full bg-brand transition-[width] ease-linear motion-reduce:transition-none ${slow ? "duration-[1100ms]" : "duration-300"}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function Check({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.2 4.2L19 7" />
    </svg>
  );
}

/** Status dot + list row used by the NADRA check, the hardware test and publishing. */
export function StageList({ items, cursor }: { items: { label: string; detail?: string; ok?: boolean }[]; cursor: number }) {
  return (
    <ol className="space-y-3">
      {items.map((s, i) => {
        const state = i < cursor ? "done" : i === cursor ? "active" : "todo";
        const warn = state === "done" && s.ok === false;
        return (
          <li key={s.label} className={`flex items-start gap-3 ${state === "todo" ? "text-ink/50" : ""}`}>
            <span
              aria-hidden
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${
                warn
                  ? "border-crack text-crack"
                  : state === "done"
                    ? "border-brand bg-brand text-snow"
                    : state === "active"
                      ? "border-brand text-brand dark:border-steel dark:text-steel"
                      : "border-ink/25"
              }`}
            >
              {warn ? "!" : state === "done" ? <Check /> : state === "active" ? <span className="h-2 w-2 animate-pulse rounded-full bg-current motion-reduce:animate-none" /> : i + 1}
            </span>
            <span className="text-[0.95rem] font-medium leading-snug">
              {s.label}
              <span className="sr-only">{state === "done" ? (warn ? ", needs attention" : ", finished") : state === "active" ? ", in progress" : ", waiting"}</span>
              {state === "done" && s.detail && <span className="block text-sm font-normal text-ink/70">{s.detail}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
