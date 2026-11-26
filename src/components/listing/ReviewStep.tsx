"use client";

import { ageOptions, paymentOptions, ptaOptions, STEPS } from "@/data/listing";
import { defectsOf, deviceTitle, gradeOf, rs, runTest, testIsFresh } from "@/lib/listing";
import { Callout } from "./ui";
import type { StepProps } from "./types";

export default function ReviewStep({ draft: d, set, errors, goTo, photoCount }: StepProps & { goTo: (i: number) => void; photoCount: number }) {
  const defects = defectsOf(d);
  const rows: { step: number; title: string; items: [string, string][] }[] = [
    {
      step: 1,
      title: "Phone",
      items: [
        ["Name", [deviceTitle(d), d.variant].filter(Boolean).join(" · ")],
        ["Specs", [d.storage, d.ram + " RAM", d.color].join(" · ")],
        ["PTA", ptaOptions.find((p) => p.value === d.pta)?.label ?? ""],
        ["IMEI", d.imei],
        ["Used for", ageOptions.find((a) => a.value === d.age)?.label ?? ""],
      ],
    },
    {
      step: 2,
      title: "Condition",
      items: [
        ["Grade", gradeOf(d) ?? ""],
        ["Defects", defects.length ? defects.join(", ") : "None reported"],
        ...(d.note ? ([["Seller note", d.note]] as [string, string][]) : []),
      ],
    },
    {
      step: 3,
      title: "Hardware test",
      items: [["Result", testIsFresh(d) ? `Verified Hardware · ${runTest(d).score} / 100` : "Not run"]],
    },
    { step: 4, title: "Photos", items: [["Added", `${photoCount} photos`]] },
    {
      step: 5,
      title: "Price and meetup",
      items: [
        ["Asking price", `${rs(Number(d.price))}${d.negotiable ? ", open to offers" : ", fixed price"}`],
        ["Payment", paymentOptions.find((p) => p.value === d.payment)?.label ?? ""],
        ["Meetup", `${d.meetup}, ${d.city}`],
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {rows.map((r) => (
          <section key={r.title} aria-label={r.title} className="rounded-2xl border border-ink/10">
            <header className="flex items-center justify-between border-b border-ink/10 px-4 py-2.5">
              <h3 className="text-sm font-semibold">{r.title}</h3>
              <button type="button" onClick={() => goTo(r.step)} className="rounded-lg px-2 py-1 text-sm font-medium text-deep hover:bg-ink/10">
                Edit<span className="sr-only"> {STEPS[r.step].label}</span>
              </button>
            </header>
            <dl className="divide-y divide-ink/10 text-[0.95rem]">
              {r.items.map(([k, v]) => (
                <div key={k} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[8rem_1fr]">
                  <dt className="text-ink/65">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <Callout title="Nothing is published until you press the button below">
        You can edit or take your listing down at any time from your account.
      </Callout>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem]">
          <input
            type="checkbox"
            checked={d.terms}
            aria-invalid={!!errors.terms}
            onChange={(e) => set({ terms: e.target.checked })}
            className={`mt-1 h-5 w-5 shrink-0 cursor-pointer accent-deep ${errors.terms ? "outline outline-2 outline-crack" : ""}`}
          />
          <span>I confirm this is my phone, the details above are accurate, and I will show it to the buyer exactly as described.</span>
        </label>
        {errors.terms && <p className="mt-1.5 text-sm text-crack">{errors.terms}</p>}
      </div>
    </div>
  );
}
