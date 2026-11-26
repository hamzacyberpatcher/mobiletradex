"use client";

import { brandOf, defectsOf, deviceTitle, gradeOf, rs, runTest, suggestPrice, testIsFresh, type Draft, type Photos } from "@/lib/listing";
import { ptaOptions, ageOptions } from "@/data/listing";
import { Check } from "./ui";

const Empty = ({ children }: { children: string }) => <span className="text-ink/40">{children}</span>;

/**
 * The listing exactly as a buyer will see it, in the fixed order the
 * interviews asked for: name, specs, condition, price. Updates as the seller types.
 */
export default function ListingPreview({ draft: d, photos }: { draft: Draft; photos: Photos }) {
  const brand = brandOf(d);
  const title = deviceTitle(d);
  const grade = gradeOf(d);
  const defects = defectsOf(d);
  const fresh = testIsFresh(d);
  const score = fresh ? runTest(d).score : null;
  const price = Number(d.price.replace(/\D/g, ""));
  const fair = suggestPrice(d)?.fair;
  const photo = photos.front ?? Object.values(photos)[0];
  const pta = ptaOptions.find((p) => p.value === d.pta)?.label;
  const age = ageOptions.find((a) => a.value === d.age)?.label;

  return (
    <article aria-label="Listing preview" className="overflow-hidden rounded-3xl border border-ink/10 bg-frost-50 shadow-[0_20px_50px_-30px_rgba(14,24,33,0.5)]">
      <div className="relative aspect-[16/10] bg-ink/5">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt="Front of the phone" className="h-full w-full object-cover" />
        ) : brand ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/brands/${brand.slug}.svg`} alt="" className="h-full w-full object-cover opacity-90" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink/50">Your photos appear here</div>
        )}
        {fresh && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-snow">
            <Check size={11} /> Verified Hardware
          </span>
        )}
      </div>

      <div className="space-y-4 p-5">
        {/* 1. name */}
        <header>
          <h3 className="text-xl font-semibold leading-tight tracking-[-0.02em]">{title || <Empty>Choose your phone</Empty>}</h3>
          {d.variant && <p className="mt-0.5 text-sm text-ink/65">{d.variant}</p>}
        </header>

        {/* 2. specs */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {[
            ["Storage", d.storage],
            ["RAM", d.ram],
            ["Colour", d.color],
            ["PTA", pta],
            ["Used for", age],
            ["Battery", d.screen || d.body ? `${d.battery}%` : ""],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-ink/60">{k}</dt>
              <dd className="font-medium">{v || <Empty>Not set</Empty>}</dd>
            </div>
          ))}
        </dl>

        {/* 3. condition: defects come first, not last */}
        <section aria-label="Condition" className="rounded-2xl border border-ink/10 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Condition</p>
            {grade ? (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${grade === "Needs repair" || grade === "Fair" ? "bg-crack/15 text-crack" : "bg-deep/15 text-deep"}`}>
                {grade}
              </span>
            ) : (
              <Empty>Not described yet</Empty>
            )}
          </div>
          {grade && (
            <ul className="mt-2 space-y-1 text-sm">
              {defects.length ? (
                defects.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-crack">
                    <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                    {x}
                  </li>
                ))
              ) : (
                <li className="text-ink/75">No defects reported.</li>
              )}
            </ul>
          )}
          {score !== null && <p className="mt-2 text-xs text-ink/65">Hardware health {score} / 100</p>}
        </section>

        {/* 4. price */}
        <footer className="flex items-end justify-between gap-3 border-t border-ink/10 pt-4">
          <div>
            <p className="text-xs text-ink/60">Asking price{d.price && d.negotiable ? ", negotiable" : ""}</p>
            <p className="text-2xl font-semibold tracking-[-0.02em]">{price ? rs(price) : <Empty>Not set</Empty>}</p>
          </div>
          {price > 0 && fair ? (
            <p className="text-right text-xs text-ink/65">Fair value {rs(fair)}</p>
          ) : null}
        </footer>

        <p className="flex items-center gap-1.5 text-xs text-ink/65">
          {d.idVerified ? <><Check size={11} /> Seller CNIC verified</> : "Seller CNIC not verified yet"}
        </p>
      </div>
    </article>
  );
}
