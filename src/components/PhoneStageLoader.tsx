"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { measureStory } from "@/lib/story";

const PhoneStage = dynamic(() => import("./phone/PhoneStage"), { ssr: false });

/** Mounts the 3D phone and keeps scroll position in sync with it. */
export default function PhoneStageLoader() {
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measureStory);
    };
    measureStory();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // layout shifts as fonts/images settle
    const t = window.setTimeout(measureStory, 400);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <PhoneStage />;
}
