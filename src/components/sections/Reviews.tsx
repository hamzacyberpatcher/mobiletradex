"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import DotGrid from "@/components/reactbits/DotGrid";
import FlipCard from "@/components/reactbits/FlipCard";
import { useTheme } from "@/components/ThemeProvider";
import { reviews, reviewGroups, type ReviewGroup } from "@/data/content";
import EvidencePhoto from "./EvidencePhoto";
import RatingSummary from "./RatingSummary";
import Stars from "./Stars";

function useCardSize() {
  const [size, setSize] = useState({ w: 340, h: 400 });
  useEffect(() => {
    const fit = () => setSize(window.innerWidth < 420 ? { w: 290, h: 380 } : { w: 340, h: 400 });
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return size;
}

function ReviewCard({ r, index, w, h }: { r: (typeof reviews)[number]; index: number; w: number; h: number }) {
  return (
    <FlipCard
      width={w}
      height={h}
      radius={20}
      background="rgb(var(--c-frost-50))"
      color="rgb(var(--c-ink))"
      tilt
      glare
      ariaLabel={`Review by ${r.name}. Press to flip the card.`}
      front={
        <div className="relative h-full w-full">
          <EvidencePhoto kind={r.evidence} tint={index} />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-night/65 px-2.5 py-1 text-xs font-medium text-snow backdrop-blur-sm">
            {r.evidence === "video" && <span aria-hidden>▶</span>}
            {r.evidenceLabel}
          </span>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 via-night/50 to-transparent px-4 pb-4 pt-12 text-snow">
            <p className="font-semibold">{r.name}</p>
            <p className="text-sm text-snow/80">{r.city}</p>
            <p className="mt-2 font-mono text-[0.7rem] text-snow/70">Tap to read the review</p>
          </div>
        </div>
      }
      back={
        <div className="flex h-full flex-col p-6">
          <Stars value={r.rating} size={18} />
          <blockquote className="mt-4 text-[1.02rem] leading-relaxed">{r.quote}</blockquote>
          <div className="mt-auto pt-4">
            <p className="font-semibold">{r.name}</p>
            <p className="text-sm text-ink/70">
              {r.role}, {r.city}
            </p>
            <p className="mt-2 font-mono text-xs text-deep">Deal closed · {r.evidenceLabel}</p>
          </div>
        </div>
      }
    />
  );
}

export default function Reviews() {
  const { theme } = useTheme();
  const { w, h } = useCardSize();
  const [group, setGroup] = useState<ReviewGroup | "all">("all");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const visible = reviews
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => group === "all" || r.group === group);
  const count = (id: ReviewGroup | "all") =>
    id === "all" ? reviews.length : reviews.filter((r) => r.group === id).length;

  return (
    <section id="reviews" className="relative z-10 overflow-hidden bg-frost px-5 py-24 md:px-8 md:py-32">
      {/* dots that ripple under the cursor, faded out at the section edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]"
      >
        <DotGrid
          dotSize={4}
          gap={24}
          baseColor={theme === "dark" ? "#22364A" : "#C3D1DC"}
          activeColor={theme === "dark" ? "#6FA4D6" : "#2E5E8E"}
          paused={reduced}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <h2 className="h-section max-w-3xl">Reviews come only from closed deals.</h2>
            <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-ink/75">
              Reviewers attach photos or video of the phone, so you can trust what
              you read. Tap a card to see what they wrote.
            </p>
          </div>
          <RatingSummary />
        </div>

        <div role="radiogroup" aria-label="Show reviews from" className="mt-14 flex flex-wrap gap-2">
          {reviewGroups.map((g) => (
            <button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={group === g.id}
              onClick={() => setGroup(g.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                group === g.id ? "border-deep bg-deep text-frost-50" : "border-ink/25 hover:border-ink"
              }`}
            >
              {g.label}
              <span className={`ml-2 font-mono text-xs ${group === g.id ? "opacity-80" : "text-ink/55"}`}>
                {count(g.id)}
              </span>
            </button>
          ))}
        </div>

        <motion.div layout className="mt-8 grid content-start justify-items-center gap-8 sm:grid-cols-2 lg:min-h-[840px] lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map(({ r, i }) => (
              <motion.div
                key={r.name}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, scale: 0.9, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              >
                <ReviewCard r={r} index={i} w={w} h={h} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
