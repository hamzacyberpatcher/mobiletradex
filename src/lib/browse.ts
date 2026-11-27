import { ageOptions, ptaOptions } from "@/data/listing";
import type { Listing } from "@/data/listings";
import type { Grade } from "@/lib/listing";
import { rs } from "@/lib/listing";

/** Everything the buyer can narrow by. Kept in sessionStorage so Back from a listing keeps the filters. */
export type Filters = {
  q: string;
  brands: string[];
  grades: Grade[];
  min: number | null;
  max: number | null;
  storage: string[];
  ram: string[];
  pta: string[];
  ages: string[];
  cities: string[];
  /** lowest battery health, 0 = any */
  battery: number;
  verified: boolean;
  /** no replaced screen or panel */
  original: boolean;
  payment: "any" | "escrow" | "cod";
  box: boolean;
  charger: boolean;
  hideSold: boolean;
  savedOnly: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  q: "",
  brands: [],
  grades: [],
  min: null,
  max: null,
  storage: [],
  ram: [],
  pta: [],
  ages: [],
  cities: [],
  battery: 0,
  verified: false,
  original: false,
  payment: "any",
  box: false,
  charger: false,
  hideSold: true,
  savedOnly: false,
};

export type Sort = "best" | "new" | "low" | "high" | "battery" | "condition";

export const sortOptions: { value: Sort; label: string }[] = [
  { value: "best", label: "Best match" },
  { value: "new", label: "Newest first" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
  { value: "battery", label: "Battery health" },
  { value: "condition", label: "Best condition" },
];

export const GRADES: Grade[] = ["Like new", "Good", "Fair", "Needs repair"];
const gradeRank = (g: Grade) => GRADES.indexOf(g);

export const pricePresets = [
  { label: "Under Rs 30,000", min: null, max: 30000 },
  { label: "Rs 30,000 to 60,000", min: 30000, max: 60000 },
  { label: "Rs 60,000 to 100,000", min: 60000, max: 100000 },
  { label: "Over Rs 100,000", min: 100000, max: null },
];

/* ---------- search ---------- */

const norm = (s: string) => s.toLowerCase().replace(/(\d)\s+(gb|tb)\b/g, "$1$2").replace(/[^a-z0-9 ]+/g, " ");
export const tokens = (q: string) => norm(q).split(/\s+/).filter(Boolean);

function fields(l: Listing): [string, number][] {
  return [
    [norm(l.title), 6],
    [norm(l.brandName), 4],
    [norm(`${l.storage} ${l.ram} ${l.color}`), 3],
    [norm(`${l.city} ${l.pta === "approved" ? "pta approved" : l.pta === "jv" ? "jv factory unlocked" : "non pta"} ${l.grade}`), 2],
    [norm(l.defects.join(" ")), 2],
    [norm(l.note), 1],
  ];
}

/**
 * Similarity score between the query and one listing. Each word counts for the
 * best field it appears in (name > brand > specs > location > defects > seller's
 * note) and prefixes count too, so "pro" finds "Pro" and "iph" finds iPhone.
 * Words that match nothing lower the score; too many misses drop the listing.
 */
export function matchScore(l: Listing, words: string[]) {
  if (!words.length) return 0;
  const fs = fields(l);
  let score = 0;
  let hit = 0;
  for (const w of words) {
    let best = 0;
    for (const [text, weight] of fs) {
      if (text.split(" ").some((t) => t === w)) best = Math.max(best, weight);
      else if (w.length > 1 && text.split(" ").some((t) => t.startsWith(w))) best = Math.max(best, weight * 0.7);
    }
    if (best) hit++;
    score += best;
  }
  return hit >= Math.max(1, Math.ceil(words.length * 0.6)) ? score : 0;
}

/* ---------- filtering ---------- */

export function passes(l: Listing, f: Filters, saved: string[]) {
  if (f.hideSold && l.status === "sold") return false;
  if (f.savedOnly && !saved.includes(l.id)) return false;
  if (f.brands.length && !f.brands.includes(l.brand)) return false;
  if (f.grades.length && !f.grades.includes(l.grade)) return false;
  if (f.min !== null && l.price < f.min) return false;
  if (f.max !== null && l.price > f.max) return false;
  if (f.storage.length && !f.storage.includes(l.storage)) return false;
  if (f.ram.length && !f.ram.includes(l.ram)) return false;
  if (f.pta.length && !f.pta.includes(l.pta)) return false;
  if (f.ages.length && !f.ages.includes(l.age)) return false;
  if (f.cities.length && !f.cities.includes(l.city)) return false;
  if (l.battery < f.battery) return false;
  if (f.verified && !l.tested) return false;
  if (f.original && l.panel === "replaced") return false;
  if (f.payment === "escrow" && l.payment === "cod") return false;
  if (f.payment === "cod" && l.payment === "escrow") return false;
  if (f.box && !l.accessories.includes("box")) return false;
  if (f.charger && !l.accessories.includes("charger")) return false;
  return true;
}

export type Result = { l: Listing; score: number };

export function run(all: Listing[], f: Filters, sort: Sort, saved: string[]): Result[] {
  const words = tokens(f.q);
  const out: Result[] = [];
  for (const l of all) {
    if (!passes(l, f, saved)) continue;
    const score = matchScore(l, words);
    if (words.length && !score) continue;
    out.push({ l, score });
  }
  const by: Record<Sort, (a: Result, b: Result) => number> = {
    best: (a, b) =>
      words.length
        ? b.score - a.score || a.l.days - b.l.days
        : Number(b.l.tested) - Number(a.l.tested) || a.l.days - b.l.days,
    new: (a, b) => a.l.days - b.l.days,
    low: (a, b) => a.l.price - b.l.price,
    high: (a, b) => b.l.price - a.l.price,
    battery: (a, b) => b.l.battery - a.l.battery,
    condition: (a, b) => gradeRank(a.l.grade) - gradeRank(b.l.grade) || b.l.battery - a.l.battery,
  };
  // sold and reserved phones sink to the bottom whatever the sort
  const live = (r: Result) => (r.l.status === "available" ? 0 : r.l.status === "reserved" ? 1 : 2);
  return out.sort((a, b) => live(a) - live(b) || by[sort](a, b));
}

/* ---------- active filter chips ---------- */

export type Chip = { key: string; label: string; clear: (f: Filters) => Filters };

export function chipsOf(f: Filters, brandName: (slug: string) => string, withQuery = false): Chip[] {
  const out: Chip[] = [];
  const many = <K extends "brands" | "grades" | "storage" | "ram" | "pta" | "ages" | "cities">(k: K, label: (v: Filters[K][number]) => string) => {
    for (const v of f[k] as Filters[K][number][]) {
      out.push({ key: `${k}:${v}`, label: label(v), clear: (x) => ({ ...x, [k]: (x[k] as string[]).filter((y) => y !== v) }) });
    }
  };
  many("brands", (v) => brandName(v as string));
  many("grades", (v) => String(v));
  many("storage", (v) => String(v));
  many("ram", (v) => `${v} RAM`);
  many("pta", (v) => ptaOptions.find((p) => p.value === v)?.label ?? String(v));
  many("ages", (v) => ageOptions.find((a) => a.value === v)?.label ?? String(v));
  many("cities", (v) => String(v));
  if (f.min !== null || f.max !== null) {
    const label = f.min !== null && f.max !== null ? `${rs(f.min)} to ${rs(f.max)}` : f.min !== null ? `Over ${rs(f.min)}` : `Under ${rs(f.max!)}`;
    out.push({ key: "price", label, clear: (x) => ({ ...x, min: null, max: null }) });
  }
  if (f.battery) out.push({ key: "battery", label: `Battery ${f.battery}%+`, clear: (x) => ({ ...x, battery: 0 }) });
  if (f.verified) out.push({ key: "verified", label: "Verified Hardware", clear: (x) => ({ ...x, verified: false }) });
  if (f.original) out.push({ key: "original", label: "No panel replaced", clear: (x) => ({ ...x, original: false }) });
  if (f.payment !== "any") out.push({ key: "payment", label: f.payment === "escrow" ? "Escrow" : "Cash at meetup", clear: (x) => ({ ...x, payment: "any" }) });
  if (f.box) out.push({ key: "box", label: "Original box", clear: (x) => ({ ...x, box: false }) });
  if (f.charger) out.push({ key: "charger", label: "Original charger", clear: (x) => ({ ...x, charger: false }) });
  if (f.savedOnly) out.push({ key: "saved", label: "Saved phones", clear: (x) => ({ ...x, savedOnly: false }) });
  if (withQuery && f.q) out.push({ key: "q", label: `Search: ${f.q}`, clear: (x) => ({ ...x, q: "" }) });
  if (!f.hideSold) out.push({ key: "sold", label: "Including sold", clear: (x) => ({ ...x, hideSold: true }) });
  return out;
}

export const ago = (days: number) => (days <= 0 ? "Today" : days === 1 ? "Yesterday" : days < 14 ? `${days} days ago` : `${Math.round(days / 7)} weeks ago`);

/** Fair-value position of an asking price: below, near or above the platform's fair value. */
export function valueTag(price: number, fair: number): { label: string; tone: "good" | "fair" | "high"; pct: number } {
  const pct = Math.round(((price - fair) / fair) * 100);
  if (pct <= -3) return { label: `${Math.abs(pct)}% below fair value`, tone: "good", pct };
  if (pct >= 3) return { label: `${pct}% above fair value`, tone: "high", pct };
  return { label: "At fair value", tone: "fair", pct };
}
