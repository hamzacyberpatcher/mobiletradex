"use client";

import { useEffect, useState } from "react";
import CircularCarousel from "@/components/reactbits/CircularCarousel";
import CountUp from "@/components/reactbits/CountUp";
import { brands } from "@/data/content";

const toNumber = (s: string) => Number(s.replace(/,/g, ""));

const items = brands.map((b) => ({
  src: `/brands/${b.slug}.svg`,
  alt: `${b.name} logo`,
  title: b.name,
  subtitle: `${b.listings} verified listings`,
}));

/**
 * Full-viewport brand ring. This section is opaque and carries `data-cover`:
 * it is where the 3D phone story ends, and the phone stops drawing once this
 * section reaches the top of the screen.
 */
export default function Brands() {
  const [cardWidth, setCardWidth] = useState(260);
  const [active, setActive] = useState(0);
  const current = brands[active] ?? brands[0];

  useEffect(() => {
    const fit = () => {
      const w = window.innerWidth;
      setCardWidth(Math.round(Math.min(380, Math.max(150, w * 0.17))));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <section
      id="brands"
      data-cover
      aria-labelledby="brands-title"
      className="relative z-10 h-[100svh] min-h-[560px] w-full overflow-hidden bg-deep-900 text-snow"
    >
      <div className="absolute inset-x-0 bottom-0 top-36 md:top-44">
      <CircularCarousel
        items={items}
        preset="orbit"
        intro="rise"
        cardWidth={cardWidth}
        aspectRatio={1.3}
        autoplay="drift"
        speed={10}
        fadeColor="rgb(var(--c-deep-900))"
        cornerRadius={20}
        parallax={0.7}
        onChange={setActive}
        className="text-snow"
      />
      </div>

      {/* live count for whichever brand is at the front of the ring */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-14 z-20 text-center md:inset-x-auto md:bottom-auto md:right-8 md:top-32 md:text-right"
        aria-live="polite"
      >
        <p className="text-lg font-medium text-mist">{current.name}</p>
        <p className="font-mono text-3xl font-semibold tabular-nums md:text-5xl">
          <CountUp
            key={current.slug}
            from={0}
            to={toNumber(current.listings)}
            duration={1.1}
            separator=","
            trigger="load"
          />
        </p>
        <p className="text-sm text-mist">verified listings</p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-deep-900 via-deep-900/80 to-transparent px-5 pb-16 pt-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 id="brands-title" className="h-section max-w-2xl">
            Every major brand, tested the same way.
          </h2>
          <p className="mt-4 max-w-[34rem] text-lg leading-relaxed text-mist">
            Drag or scroll sideways to browse. Each phone comes with its own
            condition report.
          </p>
        </div>
      </div>
    </section>
  );
}
