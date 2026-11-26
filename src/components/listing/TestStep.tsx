"use client";

import { useEffect, useState } from "react";
import { runTest, testIsFresh, testSig } from "@/lib/listing";
import { useToast } from "@/components/ToastProvider";
import { Callout, Check, ProgressBar, StageList } from "./ui";
import type { StepProps } from "./types";

const STAGE_MS = 1100;

/** Simulated hardware test. The real product runs this inside the MobileTradeX app. */
export default function TestStep({ draft, set, errors }: StepProps) {
  const { toast } = useToast();
  const { rows, score } = runTest(draft);
  const fresh = testIsFresh(draft);
  const [cursor, setCursor] = useState(fresh ? rows.length : 0);
  const [running, setRunning] = useState(false);
  const stale = !!draft.testSig && !fresh;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => {
      if (cursor + 1 >= rows.length) {
        setCursor(rows.length);
        setRunning(false);
        set({ testSig: testSig(draft) });
        toast("Hardware test finished. Your phone earned the Verified Hardware badge.", { kind: "success" });
      } else setCursor(cursor + 1);
    }, STAGE_MS);
    return () => clearTimeout(id);
  }, [running, cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  const begin = () => {
    setCursor(0);
    setRunning(true);
  };
  const cancel = () => {
    setRunning(false);
    toast("Hardware test paused. Nothing was saved.", { action: { label: "Resume", onClick: () => setRunning(true) } });
  };

  const pct = fresh ? 100 : running || cursor > 0 ? Math.round(((cursor + (running ? 1 : 0)) / rows.length) * 100) : 0;
  const inProgress = running || (cursor > 0 && !fresh);

  return (
    <div className="space-y-6">
      {stale && !running && (
        <Callout kind="warn" title="Your details changed after the test">
          Run it again so the report matches the phone you are listing.
        </Callout>
      )}

      {!inProgress && !fresh && (
        <div className="rounded-2xl border border-ink/10 p-5">
          <p className="font-semibold">Before you start</p>
          <ul className="mt-2 space-y-1.5 text-[0.95rem] text-ink/80">
            <li>Keep the phone nearby and plugged in. It takes about a minute.</li>
            <li>Turn the volume up so the speaker check can hear itself.</li>
            <li>We check the IMEI against the PTA and police blacklists.</li>
          </ul>
          <button type="button" data-autofocus onClick={begin} className="btn btn-primary mt-5">
            {stale ? "Run the test again" : "Start hardware test"}
          </button>
        </div>
      )}

      {(inProgress || fresh) && (
        <div className="rounded-2xl border border-ink/10 p-5" aria-live="polite">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="font-semibold">{fresh ? "Test complete" : "Testing your phone"}</p>
            <p className="text-sm tabular-nums text-ink/70">{pct}%</p>
          </div>
          <ProgressBar value={pct} label="Hardware test progress" slow />
          <div className="mt-5">
            <StageList items={rows.map((r) => ({ label: r.label, detail: r.detail, ok: r.ok }))} cursor={cursor} />
          </div>
          {running && (
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={cancel} className="btn btn-quiet !px-5 !py-2">Cancel</button>
            </div>
          )}
        </div>
      )}

      {fresh && (
        <div className="grid items-center gap-4 rounded-2xl border border-deep/40 bg-deep/10 p-5 sm:grid-cols-[auto_1fr]">
          <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-deep text-center">
            <div>
              <p className="text-2xl font-semibold leading-none">{score}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink/70">of 100</p>
            </div>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-semibold text-deep"><Check size={15} /> Verified Hardware</p>
            <p className="mt-1 text-sm text-ink/80">
              {rows.every((r) => r.ok) ? "Everything passed." : "Faults are listed on your report so buyers see them before the meetup."} This report is attached to your listing.
            </p>
            <button type="button" onClick={begin} className="mt-2 text-sm font-medium text-deep underline-offset-2 hover:underline">Run again</button>
          </div>
        </div>
      )}

      {errors.test && !running && <p role="alert" aria-invalid="true" tabIndex={-1} className="text-sm text-crack">{errors.test}</p>}
      <p className="text-xs text-ink/55">Prototype: the result is simulated from the details you entered. The real test runs on the phone itself.</p>
    </div>
  );
}
