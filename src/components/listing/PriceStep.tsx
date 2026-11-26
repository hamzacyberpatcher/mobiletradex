"use client";

import { cities, paymentOptions } from "@/data/listing";
import { digits, rs, suggestPrice } from "@/lib/listing";
import { useToast } from "@/components/ToastProvider";
import { Callout, ChipGroup, Field, inputCls } from "./ui";
import type { StepProps } from "./types";

const fmt = (s: string) => {
  const d = digits(s).slice(0, 7).replace(/^0+/, "");
  return d ? Number(d).toLocaleString("en-US") : "";
};

export default function PriceStep({ draft, set, errors }: StepProps) {
  const { toast } = useToast();
  const sug = suggestPrice(draft);
  const price = Number(digits(draft.price));
  const city = cities.find((c) => c.name === draft.city);

  const diff = sug && price ? Math.round(((price - sug.fair) / sug.fair) * 100) : 0;
  const feedback =
    !sug || !price
      ? null
      : price > sug.high
        ? { kind: "warn" as const, title: `${diff}% above the fair price`, body: "Phones priced this far above fair value usually take two to three times longer to sell, and buyers may not make an offer." }
        : price < sug.low
          ? { kind: "info" as const, title: `${Math.abs(diff)}% below the fair price`, body: "This will sell quickly, but you could ask for more. Check that you have not left out a digit." }
          : { kind: "success" as const, title: "Inside the fair range", body: "Buyers see this as a fair price for this phone, so expect offers within a few days." };

  // position on the range bar (0 to 100%)
  const lo = sug ? sug.low * 0.75 : 0;
  const hi = sug ? sug.high * 1.25 : 1;
  const pos = (v: number) => Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100));

  return (
    <div className="space-y-8">
      {sug && (
        <section aria-label="Suggested price" className="rounded-2xl border border-deep/40 bg-deep/10 p-5">
          <p className="text-sm font-medium text-ink/75">Suggested price for your phone</p>
          <p className="mt-1 text-4xl font-semibold tracking-[-0.03em]">{rs(sug.fair)}</p>
          <p className="mt-1 text-sm text-ink/75">Fair range {rs(sug.low)} to {rs(sug.high)}</p>

          <div className="relative mt-6 h-2 rounded-full bg-ink/15" role="img" aria-label={`Fair range ${rs(sug.low)} to ${rs(sug.high)}${price ? `, your price ${rs(price)}` : ""}`}>
            <div className="absolute inset-y-0 rounded-full bg-deep" style={{ left: `${pos(sug.low)}%`, width: `${pos(sug.high) - pos(sug.low)}%` }} />
            {price > 0 && (
              <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-frost-50 bg-ink shadow transition-[left] duration-300 motion-reduce:transition-none" style={{ left: `${pos(price)}%` }} />
            )}
          </div>
          <div className="mt-2 flex justify-between text-xs text-ink/65"><span>Low</span><span>Fair</span><span>High</span></div>

          <details className="mt-4 group">
            <summary className="cursor-pointer text-sm font-medium text-deep underline-offset-2 hover:underline">How we worked this out</summary>
            <ul className="mt-3 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-frost-50 text-sm">
              <li className="flex justify-between px-3.5 py-2"><span>Typical used {draft.model}</span><span className="tabular-nums">{rs(sug.base)}</span></li>
              {sug.factors.map((f) => (
                <li key={f.label} className="flex justify-between px-3.5 py-2">
                  <span>{f.label}</span>
                  <span className={`tabular-nums ${f.pct < 0 ? "text-crack" : "text-deep"}`}>{f.pct > 0 ? "+" : ""}{f.pct}%</span>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      <div>
        <Field label="Your asking price" error={errors.price}>
          {(p) => (
            <div className="flex flex-wrap items-stretch gap-3">
              <div className="relative min-w-[14rem] flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/60">Rs</span>
                <input {...p} className={`${inputCls(!!errors.price)} pl-11 text-lg font-semibold tabular-nums`} inputMode="numeric" value={fmt(draft.price)} placeholder={sug ? sug.fair.toLocaleString("en-US") : "0"} onChange={(e) => set({ price: digits(e.target.value) })} />
              </div>
              {sug && (
                <button type="button" className="btn btn-quiet !py-2" onClick={() => { set({ price: String(sug.fair) }); toast(`Price set to ${rs(sug.fair)}.`); }}>
                  Use suggested price
                </button>
              )}
            </div>
          )}
        </Field>
        {feedback && !errors.price && (
          <div className="mt-3" aria-live="polite">
            <Callout kind={feedback.kind} title={feedback.title}>{feedback.body}</Callout>
          </div>
        )}
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-ink/15 px-4 py-3.5">
        <span>
          <span className="block font-medium">Open to offers</span>
          <span className="block text-sm text-ink/65">Buyers can send offers through structured templates. Your number stays hidden.</span>
        </span>
        <input type="checkbox" role="switch" checked={draft.negotiable} onChange={(e) => set({ negotiable: e.target.checked })} className="h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-ink/25 transition-colors checked:bg-deep relative before:absolute before:left-0.5 before:top-0.5 before:h-5 before:w-5 before:rounded-full before:bg-snow before:transition-transform checked:before:translate-x-5" />
      </label>

      <ChipGroup legend="How do you want to be paid?" options={paymentOptions} value={draft.payment} onChange={(v) => set({ payment: v })} />

      <ChipGroup legend="Your city" options={cities.map((c) => ({ value: c.name, label: c.name }))} value={draft.city} onChange={(v) => set({ city: v, meetup: "" })} error={errors.city} columns="sm:grid-cols-5" />
      {city && (
        <ChipGroup
          legend="Safe meetup zone"
          options={city.zones.map((z) => ({ value: z, label: z, hint: "Verified public place with CCTV" }))}
          value={draft.meetup}
          onChange={(v) => set({ meetup: v })}
          error={errors.meetup}
          columns="sm:grid-cols-2"
        />
      )}
    </div>
  );
}
