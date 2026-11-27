"use client";

import Link from "next/link";
import type { Listing } from "@/data/listings";
import { ptaOptions } from "@/data/listing";
import { rs } from "@/lib/listing";
import { ago, valueTag } from "@/lib/browse";
import PhonePhoto from "./PhonePhoto";
import { GradeChip, Icon, ICONS, NotTestedBadge, payLabel, SaveButton, VerifiedBadge } from "./ui";

/** Wrap each matched search word in <mark> so the buyer sees why a phone ranked. */
export function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  // "128gb" in the query should light up "128 GB" in the text
  const pat = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/^(\d+)(gb|tb)$/i, "$1\\s*$2"));
  const re = new RegExp(`(${pat.join("|")})`, "ig");
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 ? (
          <mark key={i} className="rounded bg-reed/50 px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * One listing in the grid. The reading order is the one the interviews asked
 * for: name, specs, condition (defects first), then price.
 */
export default function ListingCard({
  l,
  words,
  saved,
  onSave,
  compared,
  onCompare,
  priority,
}: {
  l: Listing;
  words: string[];
  saved: boolean;
  onSave: () => void;
  compared: boolean;
  onCompare: () => void;
  priority?: boolean;
}) {
  const tag = valueTag(l.price, l.fair);
  const pta = ptaOptions.find((p) => p.value === l.pta)?.label;
  const gone = l.status !== "available";
  const first = l.defects.slice(0, 2);

  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-frost-50 transition-[border-color,box-shadow] duration-200 hover:border-deep/50 hover:shadow-[0_20px_50px_-30px_rgba(14,24,33,0.55)] ${compared ? "border-deep ring-1 ring-deep" : "border-ink/10"}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
        <div className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none ${gone ? "opacity-60 saturate-50" : ""}`}>
          <PhonePhoto color={l.color} shot="front" cracked={l.screen === "cracked"} scuffed={l.body !== "mint"} seed={Number(l.id)} />
        </div>
        <div className="absolute left-3 top-3">{l.tested ? <VerifiedBadge small /> : <NotTestedBadge small />}</div>
        <SaveButton on={saved} onClick={onSave} title={l.title} className="absolute right-3 top-3 z-10" />
        {gone && (
          <span className="absolute bottom-3 left-3 rounded-full bg-night/80 px-3 py-1 text-xs font-semibold text-snow backdrop-blur">
            {l.status === "sold" ? "Sold" : "Reserved"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* 1. name */}
        <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em]">
          <Link href={`/browse/${l.id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-3xl">
            <Highlight text={l.title} words={words} />
          </Link>
        </h3>
        {/* 2. specs */}
        <p className="mt-1 text-sm text-ink/75">
          <Highlight text={`${l.storage}, ${l.ram} RAM, ${l.color}`} words={words} />
          <span className="block">{pta}, {ptaAge(l.age)}</span>
        </p>

        {/* 3. condition, defects first */}
        <div className="mt-3 border-t border-ink/10 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <GradeChip grade={l.grade} />
            <span className="text-xs text-ink/70">Battery {l.battery}%</span>
          </div>
          {first.length ? (
            <ul className="mt-2 space-y-1 text-sm">
              {first.map((d) => (
                <li key={d} className="flex items-start gap-1.5 text-ink">
                  <span className="mt-0.5 text-crack"><Icon d={ICONS.warn} size={14} /></span>
                  {d}
                </li>
              ))}
              {l.defects.length > 2 && <li className="pl-5 text-xs text-ink/65">and {l.defects.length - 2} more on the listing</li>}
            </ul>
          ) : (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink/80">
              <span className="text-deep"><Icon d={ICONS.shield} size={14} /></span>
              No defects reported
            </p>
          )}
        </div>

        {/* 4. price */}
        <div className="mt-auto pt-4">
          <p className="text-2xl font-semibold tracking-[-0.02em]">{rs(l.price)}</p>
          <p className={`text-sm ${tag.tone === "high" ? "text-crack" : "text-ink/75"}`}>
            {tag.label}
            {l.negotiable ? ", negotiable" : ""}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-ink/10 pt-3 text-xs text-ink/70">
            <span className="flex items-center gap-1"><Icon d={ICONS.pin} size={13} />{l.city}, {ago(l.days).toLowerCase()}</span>
            <span>{payLabel[l.payment]}</span>
          </div>
        </div>
      </div>

      <label className="relative z-10 flex cursor-pointer items-center gap-2.5 border-t border-ink/10 bg-frost/60 px-5 py-3 text-sm font-medium">
        <input type="checkbox" checked={compared} onChange={onCompare} className="h-4 w-4 accent-[rgb(var(--c-deep))]" />
        Compare
        <span className="sr-only">{l.title}</span>
      </label>
    </article>
  );
}

const AGE: Record<string, string> = { lt6: "under 6 months old", "6to12": "6 to 12 months old", "1to2": "1 to 2 years old", "2to3": "2 to 3 years old", "3plus": "over 3 years old" };
const ptaAge = (a: string) => AGE[a] ?? "";

export function CardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-3xl border border-ink/10 bg-frost-50">
      <div className="aspect-[4/3] animate-pulse bg-ink/10 motion-reduce:animate-none" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-ink/10 motion-reduce:animate-none" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-ink/10 motion-reduce:animate-none" />
        <div className="h-16 animate-pulse rounded-2xl bg-ink/5 motion-reduce:animate-none" />
        <div className="h-7 w-1/3 animate-pulse rounded-full bg-ink/10 motion-reduce:animate-none" />
      </div>
    </div>
  );
}
