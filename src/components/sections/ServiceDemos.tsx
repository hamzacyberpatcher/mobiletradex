"use client";

import { useEffect, useRef, useState } from "react";
import ElasticSlider from "@/components/reactbits/ElasticSlider";
import HoldButton from "@/components/reactbits/HoldButton";
import PeekRating from "@/components/reactbits/PeekRating";
import DecryptedText from "@/components/reactbits/DecryptedText";
import { useTheme } from "@/components/ThemeProvider";

/** Hex colours for the React Bits controls, which take colour props rather than CSS classes. */
function usePalette() {
  const dark = useTheme().theme === "dark";
  return dark
    ? { accent: "#6FA4D6", track: "#2A3E52", text: "#E6EBE8", onAccent: "#0E1821", surface: "#162432" }
    : { accent: "#2E5E8E", track: "#B7C9D8", text: "#12202D", onAccent: "#F3F6F4", surface: "#F3F6F4" };
}

const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** Fair value pricing: drag the battery health, the suggested price follows. */
export function PricingDemo() {
  const c = usePalette();
  const [health, setHealth] = useState(87);
  const price = Math.round((48000 + health * 155) / 500) * 500;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span className="text-ink/70">Battery health {health}%</span>
        <span className="font-mono font-semibold text-deep">PKR {fmt(price)}</span>
      </div>
      <ElasticSlider
        defaultValue={87}
        startingValue={50}
        maxValue={100}
        valuePosition="none"
        leftIcon={<span className="font-mono text-xs text-ink/60">50%</span>}
        rightIcon={<span className="font-mono text-xs text-ink/60">100%</span>}
        trackColor={c.track}
        rangeColor={c.accent}
        iconColor={c.text}
        ariaLabel="Battery health"
        onChange={(v) => setHealth(Math.round(v))}
      />
    </div>
  );
}

const CHECKS = ["Display", "Battery", "Cameras", "IMEI"];

/** Verified phones: run the hardware test and watch the checks land. */
export function VerifyDemo() {
  const [done, setDone] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const run = () => {
    if (running) return;
    setDone(0);
    setRunning(true);
    let n = 0;
    timer.current = setInterval(() => {
      n += 1;
      setDone(n);
      if (n >= CHECKS.length && timer.current) {
        clearInterval(timer.current);
        setRunning(false);
      }
    }, 550);
  };

  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={run} disabled={running} className="btn btn-primary !px-4 !py-2 text-sm disabled:opacity-60">
        {done >= CHECKS.length ? "Run again" : running ? "Testing…" : "Run hardware test"}
      </button>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm" aria-live="polite">
        {CHECKS.map((c, i) => (
          <li key={c} className={i < done ? "text-ink" : "text-ink/35"}>
            <span className="mr-1.5 inline-block w-4 text-deep">{i < done ? "✓" : "·"}</span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Escrow: hold the button to release the funds. */
export function EscrowDemo() {
  const c = usePalette();
  return (
    <div className="flex flex-wrap items-center gap-4">
      <HoldButton
        holdTime={1400}
        resetAfter={2600}
        doneLabel="Funds released"
        backgroundColor={c.accent}
        fillColor="#C5C49B"
        textColor={c.onAccent}
        fillTextColor="#12202D"
      >
        Hold to release funds
      </HoldButton>
      <p className="max-w-[14rem] text-sm text-ink/65">
        You&rsquo;ve inspected the phone. Hold to pay the seller.
      </p>
    </div>
  );
}

const SPOTS = [
  { name: "City mall", note: "1.2 km, open until 10 pm" },
  { name: "Community centre", note: "2.0 km, staffed reception" },
  { name: "Metro station", note: "2.6 km, always busy" },
];

/** Safe meetup spots: pick one. */
export function MeetupDemo() {
  const [pick, setPick] = useState(0);
  return (
    <div>
      <div role="radiogroup" aria-label="Meetup spot" className="flex flex-wrap gap-2">
        {SPOTS.map((s, i) => (
          <button
            key={s.name}
            type="button"
            role="radio"
            aria-checked={pick === i}
            onClick={() => setPick(i)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              pick === i ? "border-deep bg-deep text-frost-50" : "border-ink/25 hover:border-ink"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-ink/65">{SPOTS[pick].note}. Both of you are about 15 minutes away.</p>
    </div>
  );
}

/** Private chat: try to read the number. */
export function ChatDemo() {
  return (
    <div className="space-y-2 text-sm">
      <p className="flex flex-wrap items-center gap-x-2">
        <span className="text-ink/65">Seller&rsquo;s number (hover to try)</span>
        <DecryptedText
          text="+92 3•• •••• •67"
          animateOn="hover"
          characters="0123456789"
          speed={40}
          maxIterations={8}
          parentClassName="font-mono font-semibold"
        />
      </p>
      <p className="inline-flex items-center gap-2 rounded-lg bg-crack/10 px-3 py-1.5 text-crack">
        <span aria-hidden>!</span>
        Fraud alert: this buyer asked to move to another app.
      </p>
    </div>
  );
}

const LABELS = ["Poor", "Fair", "Good", "Great", "Excellent"];

/** Reviews: rate a closed deal. */
export function ReviewDemo() {
  const c = usePalette();
  const [value, setValue] = useState(0);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <PeekRating
        count={5}
        labels={LABELS}
        activeColor={c.accent}
        idleColor={c.track}
        size={30}
        onChange={setValue}
        ariaLabel="Rate this deal"
      />
      <p className="text-sm text-ink/65" aria-live="polite">
        {value ? `You rated this deal ${LABELS[value - 1].toLowerCase()}. Add a photo to post it.` : "Only available after a closed deal."}
      </p>
    </div>
  );
}
