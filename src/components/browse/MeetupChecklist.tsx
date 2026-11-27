"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/data/listings";
import { ProgressBar } from "@/components/listing/ui";

/**
 * Things to check in person, tailored to this listing. Putting the list on the
 * page means the buyer does not have to remember it at the meetup (Shneiderman 8,
 * Mandel: reduce memory load) and each tick is saved per listing.
 */
export default function MeetupChecklist({ l }: { l: Listing }) {
  const items = [
    { id: "imei", label: "Dial *#06# and match the IMEI", hint: `It should start with ${l.imei.slice(0, 4)} and end with ${l.imei.slice(-3)}.` },
    { id: "screen", label: l.screen === "cracked" ? "Look at the cracked area and test touch across it" : "Check the screen for dead pixels and ghost touches", hint: "Open a white and a black image at full brightness." },
    { id: "battery", label: `Check battery health is near ${l.battery}%`, hint: l.brand === "apple" ? "Settings, Battery, Battery Health." : "Use the phone's built-in diagnostics or a battery app." },
    { id: "parts", label: l.panel === "replaced" ? "Ask for proof of the screen or panel replacement" : "Look for signs the phone was opened or repaired", hint: "Uneven gaps and loose screws are warning signs." },
    { id: "sim", label: "Insert your SIM and make a call", hint: l.pta === "approved" ? "It should register on your network at once." : "Confirm it works on your network before paying." },
    { id: "pay", label: l.payment === "cod" ? "Count the cash only after you are happy with the phone" : "Confirm in the app only after every check above", hint: "Once you confirm, escrow releases the money." },
  ];
  const key = `mtx-check-${l.id}`;
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, [key]);
  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };
  const all = done.length === items.length;

  return (
    <section aria-labelledby="check" className="rounded-3xl border border-ink/10 bg-frost-50 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="check" className="text-lg font-semibold">Meetup checklist</h2>
        <p role="status" className="text-sm font-medium text-ink/75">{all ? "All checks done" : `${done.length} of ${items.length} done`}</p>
      </div>
      <p className="mt-1 text-sm text-ink/70">Open this on your phone at the meetup. Your ticks are saved on this device.</p>
      <div className="mt-3"><ProgressBar value={(done.length / items.length) * 100} label="Meetup checks completed" /></div>
      <ul className="mt-4 space-y-1">
        {items.map((i) => (
          <li key={i.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 hover:bg-ink/5">
              <input type="checkbox" checked={done.includes(i.id)} onChange={() => toggle(i.id)} className="mt-1 h-4 w-4 shrink-0 accent-[rgb(var(--c-deep))]" />
              <span className={`text-[0.95rem] font-medium leading-snug ${done.includes(i.id) ? "text-ink/55 line-through" : ""}`}>
                {i.label}
                <span className="block text-sm font-normal text-ink/65 no-underline">{i.hint}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
