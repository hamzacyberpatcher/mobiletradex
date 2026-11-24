"use client";

import { motion } from "motion/react";
import CountUp from "@/components/reactbits/CountUp";
import Stars from "./Stars";
import { ratingSummary } from "@/data/content";

/** Headline rating: numbers count up and the bars fill when scrolled into view. */
export default function RatingSummary() {
  const { average, total, distribution } = ratingSummary;
  return (
    <div className="rounded-2xl border border-ink/10 bg-frost-50/80 p-6 backdrop-blur-sm md:p-7">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <p className="font-mono text-6xl font-semibold leading-none tabular-nums text-deep md:text-7xl">
          <CountUp from={0} to={average} decimals={1} duration={1.6} trigger="view" />
        </p>
        <div className="pb-1">
          <Stars value={average} size={20} />
          <p className="mt-1.5 text-sm text-ink/70">
            <span className="font-mono tabular-nums">
              <CountUp from={0} to={total} separator="," duration={1.8} trigger="view" />
            </span>{" "}
            closed-deal reviews
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5" aria-label="Rating breakdown">
        {distribution.map((pct, i) => (
          <li key={i} className="grid grid-cols-[2.4rem_1fr_2.8rem] items-center gap-3 text-sm">
            <span className="font-mono text-ink/70">{5 - i} ★</span>
            <span className="h-2 overflow-hidden rounded-full bg-ink/10">
              <motion.span
                className="block h-full rounded-full bg-deep"
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            <span className="text-right font-mono text-ink/70">{pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
