"use client";

import { useState } from "react";
import { ageOptions, phoneBrands, ptaOptions } from "@/data/listing";
import { cities } from "@/data/listing";
import { listings } from "@/data/listings";
import { GRADES, pricePresets, type Filters } from "@/lib/browse";
import { Icon, ICONS } from "./ui";

const STORAGE = ["64 GB", "128 GB", "256 GB", "512 GB"];
const RAM = ["4 GB", "6 GB", "8 GB", "12 GB"];
const BATTERY = [
  { v: 0, label: "Any" },
  { v: 80, label: "80%+" },
  { v: 85, label: "85%+" },
  { v: 90, label: "90%+" },
];

const GRADE_HINT: Record<string, string> = {
  "Like new": "No marks, strong battery",
  Good: "Minor wear, works fully",
  Fair: "Visible wear or a small fault",
  "Needs repair": "Damage or faults, priced low",
};

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        on ? "border-deep bg-deep/10 text-ink ring-1 ring-deep" : "border-ink/20 text-ink hover:border-ink/45 hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
  );
}

function Group({ title, children, open = true }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-ink/10 py-4 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[0.95rem] font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-ink/60 transition-transform group-open:rotate-180 motion-reduce:transition-none"><Icon d={ICONS.chevron} size={16} /></span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function Switch({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-start justify-between gap-4 py-1.5 text-left">
      <span>
        <span className="block text-[0.95rem] font-medium">{label}</span>
        {hint && <span className="block text-xs leading-snug text-ink/65">{hint}</span>}
      </span>
      <span aria-hidden className={`mt-0.5 flex h-6 w-10 shrink-0 items-center rounded-full border p-0.5 transition-colors ${on ? "border-brand bg-brand" : "border-ink/30 bg-transparent"}`}>
        <span className={`h-4 w-4 rounded-full transition-transform motion-reduce:transition-none ${on ? "translate-x-4 bg-snow" : "bg-ink/50"}`} />
      </span>
    </button>
  );
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Every filter in one place. Used in the desktop sidebar and in the mobile filters dialog. */
export default function FilterPanel({ f, set }: { f: Filters; set: (patch: Partial<Filters>) => void }) {
  const [allBrands, setAllBrands] = useState(false);
  const counts = new Map<string, number>();
  for (const l of listings) if (l.status !== "sold") counts.set(l.brand, (counts.get(l.brand) ?? 0) + 1);
  const brands = phoneBrands.filter((b) => counts.has(b.slug)).sort((a, b) => (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0));
  const shown = allBrands ? brands : brands.slice(0, 6);
  const num = (s: string) => (s.trim() === "" ? null : Math.max(0, Number(s.replace(/\D/g, "")) || 0));
  const inverted = f.min !== null && f.max !== null && f.min > f.max;

  return (
    <div>
      <Group title="Price">
        <div className="flex flex-wrap gap-2">
          {pricePresets.map((p) => (
            <Chip key={p.label} on={f.min === p.min && f.max === p.max} onClick={() => set(f.min === p.min && f.max === p.max ? { min: null, max: null } : { min: p.min, max: p.max })}>
              {p.label}
            </Chip>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["min", "max"] as const).map((k) => (
            <label key={k} className="block text-xs text-ink/70">
              {k === "min" ? "Lowest price (Rs)" : "Highest price (Rs)"}
              <input
                inputMode="numeric"
                value={f[k] === null ? "" : f[k]!.toLocaleString("en-US")}
                onChange={(e) => set({ [k]: num(e.target.value) })}
                placeholder={k === "min" ? "0" : "Any"}
                aria-invalid={inverted}
                className={`mt-1 w-full rounded-xl border bg-frost px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 ${inverted ? "border-crack focus:ring-crack/30" : "border-ink/20 hover:border-ink/40 focus:border-deep focus:ring-deep/30"}`}
              />
            </label>
          ))}
        </div>
        {inverted && <p className="mt-2 text-sm text-crack">The lowest price is above the highest. Swap them to see phones.</p>}
      </Group>

      <Group title="Condition">
        <div className="space-y-2">
          {GRADES.map((g) => {
            const on = f.grades.includes(g);
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                onClick={() => set({ grades: toggle(f.grades, g) })}
                className={`flex w-full flex-col items-start rounded-xl border px-3.5 py-2 text-left transition-colors ${on ? "border-deep bg-deep/10 ring-1 ring-deep" : "border-ink/20 hover:border-ink/45 hover:bg-ink/5"}`}
              >
                <span className="text-[0.95rem] font-medium">{g}</span>
                <span className="text-xs text-ink/65">{GRADE_HINT[g]}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 border-t border-ink/10 pt-2">
          <Switch on={f.original} onChange={(v) => set({ original: v })} label="No replaced screen or panel" hint="Hides phones that were opened and repaired" />
          <Switch on={f.verified} onChange={(v) => set({ verified: v })} label="Verified Hardware only" hint="Passed the MobileTradeX hardware test" />
        </div>
      </Group>

      <Group title="Brand">
        <ul className="space-y-0.5">
          {shown.map((b) => {
            const on = f.brands.includes(b.slug);
            return (
              <li key={b.slug}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-ink/5">
                  <input type="checkbox" checked={on} onChange={() => set({ brands: toggle(f.brands, b.slug) })} className="h-4 w-4 accent-[rgb(var(--c-deep))]" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/brands/${b.slug}.svg`} alt="" className="h-6 w-6 rounded-md object-cover" />
                  <span className="flex-1 text-[0.95rem]">{b.name}</span>
                  <span className="text-xs tabular-nums text-ink/60">{counts.get(b.slug)}</span>
                </label>
              </li>
            );
          })}
        </ul>
        {brands.length > 6 && (
          <button type="button" onClick={() => setAllBrands(!allBrands)} className="mt-2 text-sm font-medium text-deep underline-offset-4 hover:underline">
            {allBrands ? "Show fewer brands" : `Show all ${brands.length} brands`}
          </button>
        )}
      </Group>

      <Group title="Storage and RAM">
        <p className="mb-2 text-xs text-ink/65">Storage</p>
        <div className="flex flex-wrap gap-2">
          {STORAGE.map((s) => <Chip key={s} on={f.storage.includes(s)} onClick={() => set({ storage: toggle(f.storage, s) })}>{s}</Chip>)}
        </div>
        <p className="mb-2 mt-4 text-xs text-ink/65">RAM</p>
        <div className="flex flex-wrap gap-2">
          {RAM.map((s) => <Chip key={s} on={f.ram.includes(s)} onClick={() => set({ ram: toggle(f.ram, s) })}>{s}</Chip>)}
        </div>
      </Group>

      <Group title="Battery health">
        <div className="flex flex-wrap gap-2">
          {BATTERY.map((b) => <Chip key={b.v} on={f.battery === b.v} onClick={() => set({ battery: b.v })}>{b.label}</Chip>)}
        </div>
      </Group>

      <Group title="PTA status" open={false}>
        <div className="space-y-2">
          {ptaOptions.map((p) => {
            const on = f.pta.includes(p.value);
            return (
              <button key={p.value} type="button" aria-pressed={on} onClick={() => set({ pta: toggle(f.pta, p.value) })} className={`flex w-full flex-col items-start rounded-xl border px-3.5 py-2 text-left transition-colors ${on ? "border-deep bg-deep/10 ring-1 ring-deep" : "border-ink/20 hover:border-ink/45 hover:bg-ink/5"}`}>
                <span className="text-[0.95rem] font-medium">{p.label}</span>
                <span className="text-xs text-ink/65">{p.hint}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Payment" open={false}>
        <div className="flex flex-wrap gap-2">
          {([["any", "Any"], ["escrow", "Escrow"], ["cod", "Cash at meetup"]] as const).map(([v, label]) => (
            <Chip key={v} on={f.payment === v} onClick={() => set({ payment: v })}>{label}</Chip>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink/65">Escrow holds the money until you have inspected the phone.</p>
      </Group>

      <Group title="City" open={false}>
        <div className="flex flex-wrap gap-2">
          {cities.map((c) => <Chip key={c.name} on={f.cities.includes(c.name)} onClick={() => set({ cities: toggle(f.cities, c.name) })}>{c.name}</Chip>)}
        </div>
      </Group>

      <Group title="Phone age" open={false}>
        <div className="flex flex-wrap gap-2">
          {ageOptions.map((a) => <Chip key={a.value} on={f.ages.includes(a.value)} onClick={() => set({ ages: toggle(f.ages, a.value) })}>{a.label}</Chip>)}
        </div>
      </Group>

      <Group title="In the box" open={false}>
        <Switch on={f.box} onChange={(v) => set({ box: v })} label="Original box" />
        <Switch on={f.charger} onChange={(v) => set({ charger: v })} label="Original charger" />
        <Switch on={!f.hideSold} onChange={(v) => set({ hideSold: !v })} label="Include sold phones" hint="Useful for comparing prices" />
      </Group>
    </div>
  );
}

