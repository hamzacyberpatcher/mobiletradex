"use client";

import { useEffect, useRef, useState } from "react";
import Aurora from "./reactbits/Aurora";
import { useTheme } from "./ThemeProvider";

// Contrast rule: text colour flips with the theme, so the glow must stay on the
// opposite side of it. Dark mode: deep, saturated colours (light text stays readable).
// Light mode: pale pastels (dark text stays readable).
const STOPS = {
  light: ["#A9C8EC", "#CDBDEB", "#BFE5D3"],
  dark: ["#1E4FA3", "#5B3FA3", "#0E6F7C"],
};

/**
 * Aurora behind the hero. It lives in a fixed layer *below* the 3D phone
 * canvas (z-index -10), fades out as you scroll away from the hero, and is
 * unmounted once it is off-screen so it stops using the GPU.
 */
export default function HeroBackground() {
  const { theme } = useTheme();
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    let raf = 0;
    const update = () => {
      const fade = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.85));
      if (box.current) box.current.style.opacity = String(fade);
      setActive(fade > 0.01);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={box}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
    >
      {active && (
        <Aurora
          colorStops={STOPS[theme]}
          lightMode={theme === "light"}
          amplitude={1.1}
          blend={0.6}
          speed={0.7}
          opacity={0.7}
          brightness={0.9}
          paused={reduced}
        />
      )}
    </div>
  );
}
