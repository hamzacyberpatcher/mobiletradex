"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ConditionHud from "./ConditionHud";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#services", label: "Services" },
  { href: "#brands", label: "Brands" },
  { href: "#reviews", label: "Reviews" },
];

export function Mark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden className="text-deep">
      <rect x="6" y="1.5" width="14" height="23" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9.5 13.5l2.6 2.6 4.6-5.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Highlight = { x: number; y: number; w: number; h: number; on: boolean };

/**
 * Floating nav in the style of reactbits.dev: a transparent bar at the top of
 * the page that, once you scroll, narrows towards the middle and turns into a
 * rounded, blurred glass bar. Links get a sliding hover pill.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hl, setHl] = useState<Highlight>({ x: 0, y: 0, w: 0, h: 0, on: false });
  const linksRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 64);
      // reading progress: where you are on the page (visibility of system status)
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      meterRef.current?.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const point = (e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    const el = e.currentTarget;
    setHl({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight, on: true });
  };
  const clear = () => setHl((h) => ({ ...h, on: false }));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-5 z-40 flex flex-col items-center px-4 md:px-6">
      <div
        data-scrolled={scrolled ? "" : undefined}
        className="group pointer-events-auto relative flex h-14 w-full max-w-full items-center justify-between rounded-2xl border border-transparent bg-transparent py-0 pl-4 pr-1.5 transition-[max-width,background-color,border-color,padding] duration-500 motion-reduce:transition-none md:max-w-[1680px] md:pl-5 md:pr-2 data-[scrolled]:border-ink/10 data-[scrolled]:bg-frost-50/80 data-[scrolled]:backdrop-blur-[24px] data-[scrolled]:backdrop-saturate-[1.4] md:data-[scrolled]:max-w-[1276px]"
      >
        <div
          ref={meterRef}
          role="progressbar"
          aria-label="Page scroll progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          className="pointer-events-none absolute inset-x-4 bottom-0 h-[3px] overflow-hidden rounded-full opacity-0 transition-opacity duration-300 group-data-[scrolled]:opacity-100"
        >
          <div ref={barRef} className="h-full origin-left bg-brand will-change-transform dark:bg-steel" style={{ transform: "scaleX(0)" }} />
        </div>
        <a href="#top" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Mark />
          MobileTradeX
        </a>

        <nav
          aria-label="Main"
          ref={linksRef}
          onMouseLeave={clear}
          className="relative hidden items-center gap-2 lg:flex"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 rounded-xl border border-ink/10 bg-frost-50 transition-[transform,width,height,opacity] duration-300 motion-reduce:transition-none"
            style={{
              transform: `translate(${hl.x}px, ${hl.y}px)`,
              width: hl.w,
              height: hl.h,
              opacity: hl.on ? 1 : 0,
            }}
          />
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onMouseEnter={point}
              onFocus={point}
              onBlur={clear}
              className="relative z-10 rounded-xl px-2.5 py-1.5 text-[13px] font-medium tracking-[0.04em] text-ink transition-transform active:scale-95 motion-reduce:transition-none"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ConditionHud />
          <ThemeToggle />
          <Link href="/sell" className="btn btn-primary !px-5 !py-2 text-[0.95rem]">
            Sell a phone
          </Link>
        </div>
      </div>
    </header>
  );
}
