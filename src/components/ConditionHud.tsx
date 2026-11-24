"use client";

import { useEffect, useRef } from "react";
import { story } from "@/lib/story";

const stage = (r: number) =>
  r < 0.15 ? "Unverified listing" : r < 0.9 ? "Inspection in progress" : "Verified Hardware";

/**
 * A small readout in the header that follows the phone: it turns the scroll animation into
 * information (condition score + stage) instead of leaving it as decoration.
 * Updates the DOM directly so scrolling never triggers React renders.
 */
export default function ConditionHud() {
  const score = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastScore = -1;
    let lastLabel = "";
    const tick = () => {
      const r = story.shown;
      const sc = Math.round(54 + r * 42);
      if (sc !== lastScore && score.current) {
        score.current.textContent = String(sc);
        lastScore = sc;
      }
      const l = stage(r);
      if (l !== lastLabel && label.current) {
        label.current.textContent = l;
        lastLabel = l;
      }
      if (bar.current) bar.current.style.transform = `scaleX(${0.54 + r * 0.42})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden
      className="hidden w-56 items-center gap-3 rounded-lg border border-ink/10 px-3 py-1 xl:flex"
    >
      <span className="flex items-baseline gap-1">
        <span ref={score} className="font-mono text-xl font-semibold tabular-nums text-deep">
          54
        </span>
        <span className="font-mono text-xs text-ink/55">/100</span>
      </span>
      <span className="min-w-0 flex-1">
        <span ref={label} className="block truncate text-xs font-medium text-ink/80">
          Unverified listing
        </span>
        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-ink/15">
          <span ref={bar} className="block h-full origin-left rounded-full bg-deep" style={{ transform: "scaleX(0.54)" }} />
        </span>
      </span>
    </div>
  );
}
