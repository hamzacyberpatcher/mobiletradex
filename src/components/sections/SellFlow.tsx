"use client";

import { useEffect, useState } from "react";
import Dialog from "@/components/Dialog";
import { useToast } from "@/components/ToastProvider";

type Stage = "confirm" | "progress" | "done";

const STEPS = [
  { label: "Confirm your CNIC", detail: "Checked against NADRA records, never shown to buyers" },
  { label: "Run the hardware test", detail: "Screen, touch, speakers, camera, battery and sensors" },
  { label: "Get a fair price suggestion", detail: "Based on model, condition and this week's local sales" },
];
const STEP_MS = 1500;

/**
 * Dialog flow behind "Slide to start selling".
 *   confirm  -> says what will happen and that nothing is published yet (error prevention)
 *   progress -> step list + progress bar with a Cancel button (visibility of status, user control)
 *   done     -> closure: what was done and what comes next (Shneiderman 5)
 * Cancelling shows a toast with "Resume" so the action can be reversed (Shneiderman 6).
 * `resumeAt` reopens the dialog straight into the progress stage at that step.
 */
export default function SellFlow({
  open,
  resumeAt,
  onClose,
}: {
  open: boolean;
  resumeAt: number | null;
  onClose: (pausedAt?: number) => void;
}) {
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>("confirm");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) return;
    if (resumeAt !== null) {
      setStep(resumeAt);
      setStage("progress");
    } else {
      setStep(0);
      setStage("confirm");
    }
  }, [open, resumeAt]);

  // advance one step at a time while in the progress stage
  useEffect(() => {
    if (!open || stage !== "progress") return;
    const id = setTimeout(() => {
      if (step + 1 >= STEPS.length) setStage("done");
      else setStep(step + 1);
    }, STEP_MS);
    return () => clearTimeout(id);
  }, [open, stage, step]);

  const pause = () => {
    onClose(step);
    toast("Listing setup paused. Nothing was published.", {
      action: { label: "Resume", onClick: () => onClose(-1 - step) },
    });
  };

  const title =
    stage === "confirm" ? "Start a new listing?" : stage === "progress" ? "Setting up your listing" : "Your draft listing is ready";
  const description =
    stage === "confirm"
      ? "We will walk you through three quick checks. Nothing is published until you review the listing and confirm it yourself."
      : stage === "progress"
        ? `Step ${step + 1} of ${STEPS.length}. Keep this window open.`
        : "All three checks passed. Review the details and publish when you are happy with them.";

  return (
    <Dialog
      open={open}
      onClose={stage === "progress" ? pause : () => onClose()}
      closeOnBackdrop={stage !== "progress"}
      title={title}
      description={description}
    >
      {stage === "confirm" && (
        <>
          <ul className="space-y-2.5 text-[0.95rem]">
            {STEPS.map((s, i) => (
              <li key={s.label} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-deep text-xs font-semibold text-frost-50">
                  {i + 1}
                </span>
                <span>
                  <span className="font-medium">{s.label}</span>
                  <span className="block text-sm text-ink/70">{s.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink/70">About 5 minutes. You can stop at any step.</p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => onClose()} className="btn btn-quiet">
              Not now
            </button>
            <button type="button" data-autofocus onClick={() => setStage("progress")} className="btn btn-primary">
              Start checks
            </button>
          </div>
        </>
      )}

      {stage === "progress" && (
        <>
          <div
            role="progressbar"
            aria-label="Listing setup progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((step / STEPS.length) * 100)}
            className="h-2 overflow-hidden rounded-full bg-ink/10"
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-[1500ms] ease-linear motion-reduce:transition-none"
              style={{ width: `${Math.round(((step + 1) / STEPS.length) * 100)}%` }}
            />
          </div>
          <ol className="mt-5 space-y-3">
            {STEPS.map((s, i) => {
              const state = i < step ? "done" : i === step ? "active" : "todo";
              return (
                <li key={s.label} className={`flex items-center gap-3 ${state === "todo" ? "text-ink/50" : ""}`}>
                  <span
                    aria-hidden
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${
                      state === "done"
                        ? "border-brand bg-brand text-snow"
                        : state === "active"
                          ? "border-brand text-brand dark:border-steel dark:text-steel"
                          : "border-ink/25"
                    }`}
                  >
                    {state === "done" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.5l4.2 4.2L19 7" />
                      </svg>
                    ) : state === "active" ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-current motion-reduce:animate-none" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="text-[0.95rem] font-medium">
                    {s.label}
                    <span className="sr-only">
                      {state === "done" ? ", finished" : state === "active" ? ", in progress" : ", waiting"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="mt-6 flex justify-end">
            <button type="button" data-autofocus onClick={pause} className="btn btn-quiet">
              Cancel
            </button>
          </div>
        </>
      )}

      {stage === "done" && (
        <>
          <dl className="divide-y divide-ink/10 rounded-2xl border border-ink/10 text-[0.95rem]">
            {[
              ["CNIC", "Verified"],
              ["Hardware health", "94 / 100"],
              ["Suggested price", "Rs 58,500"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-4 py-3">
                <dt className="text-ink/70">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => onClose()} className="btn btn-quiet">
              Save for later
            </button>
            <button
              type="button"
              data-autofocus
              onClick={() => {
                onClose();
                toast("Listing published. You can edit or take it down any time.", {
                  kind: "success",
                  action: { label: "Undo", onClick: () => toast("Listing taken down. Your draft is saved.") },
                });
              }}
              className="btn btn-primary"
            >
              Review and publish
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}
