"use client";

import { useCallback, useEffect, useState } from "react";
import { Check } from "@/components/listing/ui";
import type { Grade } from "@/lib/listing";

/* Shared bits for the browse pages. Same tokens and shapes as /sell (consistency, Nielsen 4). */

const GRADE_TONE: Record<Grade, string> = {
  "Like new": "border-deep bg-deep/10 text-ink",
  Good: "border-ink/30 bg-transparent text-ink",
  Fair: "border-reed bg-reed/30 text-ink",
  "Needs repair": "border-crack bg-crack/10 text-ink",
};

/** Condition is shown with a word and an outline, never by colour alone. */
export function GradeChip({ grade, size = "sm" }: { grade: Grade; size?: "sm" | "md" }) {
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${GRADE_TONE[grade]} ${size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs"}`}>
      {grade}
    </span>
  );
}

export function VerifiedBadge({ small }: { small?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-brand font-semibold text-snow ${small ? "px-2.5 py-1 text-xs" : "px-3 py-1 text-sm"}`}>
      <Check size={small ? 10 : 12} /> Verified Hardware
    </span>
  );
}

export function NotTestedBadge({ small }: { small?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-ink/25 bg-frost-50 font-medium text-ink ${small ? "px-2.5 py-1 text-xs" : "px-3 py-1 text-sm"}`}>
      Not tested yet
    </span>
  );
}

export const payLabel = { escrow: "Escrow", cod: "Cash at meetup", both: "Escrow or cash" } as const;

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <span aria-hidden style={{ width: size, height: size }} className="grid shrink-0 place-items-center rounded-full bg-deep text-sm font-semibold text-frost-50">
      {initials}
    </span>
  );
}

/** Small line icons, stroke style matched to the rest of the site. */
export function Icon({ d, size = 16, fill }: { d: string; size?: number; fill?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export const ICONS = {
  heart: "M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.700 3.900 4.500 7.100 4.500c2 0 3.700 1.100 4.900 2.900 1.200-1.800 2.900-2.900 4.900-2.900 3.200 0 5.400 3.200 4.300 6.600-1.700 4.800-9.200 9.400-9.200 9.400z",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
  filter: "M4 6h16M7 12h10M10 18h4",
  warn: "M12 8v5M12 16.5v.01M10.300 3.900L2.400 18a2 2 0 001.700 3h15.800a2 2 0 001.700-3L13.700 3.900a2 2 0 00-3.400 0z",
  pin: "M12 21s-6.500-5.700-6.500-11a6.500 6.500 0 1113 0c0 5.300-6.500 11-6.500 11zM12 12.500a2.500 2.500 0 100-5 2.500 2.500 0 000 5z",
  shield: "M12 3l7.500 3v5.500c0 4.800-3.200 8.200-7.500 9.500-4.300-1.300-7.500-4.700-7.500-9.500V6L12 3zM8.800 12l2.400 2.400 4-4.600",
  chat: "M4 5h16v11H9l-5 4V5z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevron: "M6 9l6 6 6-6",
  x: "M6 6l12 12M18 6L6 18",
};

/** Saved phones, kept in this browser only (localStorage `mtx-saved`). */
const SAVED_KEY = "mtx-saved";

export function useSaved() {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);
  const write = useCallback((next: string[]) => {
    setSaved(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {}
  }, []);
  const toggle = useCallback((id: string) => write(saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id]), [saved, write]);
  return { saved, toggle };
}

export function SaveButton({ on, onClick, title, className = "" }: { on: boolean; onClick: () => void; title: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? `Remove ${title} from saved phones` : `Save ${title}`}
      className={`grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-frost-50/90 backdrop-blur transition-colors hover:bg-frost-50 ${on ? "text-crack" : "text-ink/70 hover:text-ink"} ${className}`}
    >
      <Icon d={ICONS.heart} size={17} fill={on} />
    </button>
  );
}

/** Recently viewed listings (localStorage `mtx-recent`, newest first, max 6). Lets buyers recognise instead of remember (Shneiderman 8, Mandel). */
const RECENT_KEY = "mtx-recent";

export function useRecent() {
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);
  const write = useCallback((next: string[]) => {
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  }, []);
  const push = useCallback((id: string) => {
    try {
      const cur: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      write([id, ...cur.filter((x) => x !== id)].slice(0, 6));
    } catch {}
  }, [write]);
  return { recent, push, restore: write, clear: () => write([]) };
}
