"use client";

import Link from "next/link";
import type { Listing } from "@/data/listings";
import { rs } from "@/lib/listing";
import PhonePhoto from "./PhonePhoto";

/** Phones the buyer opened lately, so they never have to remember or search for them again. */
export default function RecentStrip({ items, onClear }: { items: Listing[]; onClear: () => void }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="recent" className="rounded-3xl border border-ink/10 bg-frost-50 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="recent" className="text-lg font-semibold">Recently viewed</h2>
        <button type="button" onClick={onClear} className="text-sm font-medium text-deep underline-offset-4 hover:underline">Clear history</button>
      </div>
      <ul className="mt-3 flex gap-3 overflow-x-auto pb-1" data-lenis-prevent>
        {items.map((l) => (
          <li key={l.id} className="relative w-44 shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-frost transition-colors hover:border-deep/50">
            <div className="aspect-[4/3] overflow-hidden">
              <PhonePhoto color={l.color} shot="front" cracked={l.screen === "cracked"} scuffed={l.body !== "mint"} seed={Number(l.id)} />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold">
                <Link href={`/browse/${l.id}`} className="after:absolute after:inset-0 after:content-['']">{l.title}</Link>
              </p>
              <p className="text-sm text-ink/75">{rs(l.price)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
