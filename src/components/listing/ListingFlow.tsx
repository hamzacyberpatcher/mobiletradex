"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Dialog from "@/components/Dialog";
import Header from "@/components/Header";
import { useToast } from "@/components/ToastProvider";
import { STEPS } from "@/data/listing";
import { DRAFT_KEY, EMPTY_DRAFT, FIELD_LABELS, deviceTitle, live, rs, validate, type Draft, type Photos, type Saved } from "@/lib/listing";
import IdentityStep from "./IdentityStep";
import DeviceStep from "./DeviceStep";
import ConditionStep from "./ConditionStep";
import TestStep from "./TestStep";
import PhotosStep from "./PhotosStep";
import PriceStep from "./PriceStep";
import ReviewStep from "./ReviewStep";
import ListingPreview from "./ListingPreview";
import { Check, ProgressBar, StageList } from "./ui";

type Modal = null | "restore" | "exit" | "discard" | "publish";

const isDirty = (d: Draft) => JSON.stringify(d) !== JSON.stringify(EMPTY_DRAFT);
const PUBLISH_STAGES = [
  { label: "Checking your listing details" },
  { label: "Attaching the hardware report and photos" },
  { label: "Publishing to MobileTradeX" },
];

function readSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

export default function ListingFlow() {
  const router = useRouter();
  const { toast } = useToast();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [photos, setPhotos] = useState<Photos>({});
  const [modal, setModal] = useState<Modal>(null);
  const [ready, setReady] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [published, setPublished] = useState<{ id: string; title: string; price: number } | null>(null);
  const pending = useRef<Saved | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const urls = useRef<Photos>({});

  const set = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const setPhoto = useCallback((id: string, p: Photos[string] | null) => {
    setPhotos((all) => {
      const next = { ...all };
      if (p) next[id] = p;
      else delete next[id];
      urls.current = next;
      return next;
    });
  }, []);

  useEffect(() => () => Object.values(urls.current).forEach((p) => URL.revokeObjectURL(p.url)), []);

  /* restore: ask before replacing an empty page with an old draft */
  useEffect(() => {
    const saved = readSaved();
    if (saved && isDirty(saved.draft)) {
      pending.current = saved;
      setModal("restore");
    } else setReady(true);
  }, []);

  /* autosave (Shneiderman 3: the system keeps what you typed) */
  useEffect(() => {
    if (!ready || published || !isDirty(draft)) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, step, maxStep } satisfies Saved));
        setSavedAt(Date.now());
      } catch {}
    }, 500);
    return () => clearTimeout(id);
  }, [draft, step, maxStep, ready, published]);

  /* move focus to the new step's heading so keyboard and screen-reader users land in the right place */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    heading.current?.focus({ preventScroll: true });
  }, [step, published]);

  const allErrors = useMemo(() => validate(step, draft, photos), [step, draft, photos]);
  // text boxes show their problem the moment something is typed; Continue stays off until nothing is missing
  const { errors, hints } = useMemo(() => live(draft), [draft]);
  const missing = Object.keys(allErrors);
  const errorCount = missing.length;
  const meta = STEPS[step];
  const photoCount = Object.keys(photos).length;

  const goTo = (i: number) => setStep(i);

  const next = () => {
    if (errorCount) return;
    if (step === STEPS.length - 1) return setModal("publish");
    setMaxStep((m) => Math.max(m, step + 1));
    setStep(step + 1);
  };

  const saveNow = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, step, maxStep } satisfies Saved));
    } catch {}
  };

  const reset = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setDraft(EMPTY_DRAFT);
    setStep(0);
    setMaxStep(0);
    setPhotos({});
    setSavedAt(null);
    setPublished(null);
  };

  const discard = () => {
    const snap = { draft, step, maxStep, photos };
    reset();
    setModal(null);
    toast("Draft discarded.", {
      duration: 8000,
      action: {
        label: "Undo",
        onClick: () => {
          setDraft(snap.draft);
          setStep(snap.step);
          setMaxStep(snap.maxStep);
          setPhotos(snap.photos);
          toast("Your draft is back.", { kind: "success" });
        },
      },
    });
  };

  const common = { draft, set, errors, hints };

  if (published) {
    return (
      <Shell savedAt={null} onExit={() => router.push("/")} exitLabel="Back to home" progress={100}>
        <section className="mx-auto max-w-2xl rounded-3xl border border-ink/10 bg-frost-50 p-8 text-center md:p-12">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-deep text-snow dark:text-night"><Check size={30} /></span>
          <h1 ref={heading} tabIndex={-1} className="mt-6 text-3xl font-semibold tracking-[-0.03em] focus-visible:!outline-none md:text-4xl">Your listing is live</h1>
          <p className="mt-2 text-ink/75">{published.title} for {rs(published.price)} is now visible to buyers in your city.</p>
          <p className="mt-4 inline-block rounded-full border border-ink/15 px-4 py-1.5 font-mono text-sm">Listing ID {published.id}</p>
          <ol className="mx-auto mt-8 max-w-md space-y-3 text-left text-[0.95rem]">
            {[
              "Buyers send offers through the app. Your number stays hidden.",
              "Accept an offer and agree a time at your safe meetup zone.",
              "The buyer inspects the phone. Escrow releases your money when they confirm.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-deep text-xs font-semibold text-frost-50">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <div className="mt-9 flex flex-col-reverse justify-center gap-3 sm:flex-row">
            <button type="button" className="btn btn-quiet" onClick={reset}>List another phone</button>
            <Link href="/" className="btn btn-primary">Back to home</Link>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell
      savedAt={savedAt}
      onExit={() => setModal("exit")}
      exitLabel="Save & exit"
      progress={(step / STEPS.length) * 100}
      onLogo={() => isDirty(draft) && toast("Your draft is saved. Continue any time.")}
      stepLabel={`Step ${step + 1} of ${STEPS.length}`}
    >
      {/* step rail */}
      <nav aria-label="Listing steps">
        <p className="text-sm font-medium text-ink/70 md:hidden">Step {step + 1} of {STEPS.length}: {meta.label}</p>
        <ol className="hidden items-center md:flex">
          {STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "current" : "todo";
            return (
              <li key={s.id} className="flex flex-1 items-center last:flex-none">
                <button
                  type="button"
                  disabled={i > maxStep}
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => goTo(i)}
                  className="group flex items-center gap-2.5 rounded-xl py-1 pr-2 text-left disabled:cursor-not-allowed"
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-semibold transition-colors ${state === "done" ? "border-brand bg-brand text-snow" : state === "current" ? "border-deep bg-deep text-frost-50" : "border-ink/25 text-ink/55"}`}>
                    {state === "done" ? <Check size={13} /> : i + 1}
                  </span>
                  <span className={`text-sm font-medium ${state === "todo" ? "text-ink/55" : "text-ink"}`}>
                    {s.label}
                    <span className="sr-only">{state === "done" ? ", completed" : state === "current" ? ", current step" : ""}</span>
                  </span>
                </button>
                {i < STEPS.length - 1 && <span aria-hidden className={`mx-2 h-px min-w-3 flex-1 ${i < step ? "bg-brand" : "bg-ink/20"}`} />}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="step-title" className="min-w-0">
          <h1 id="step-title" ref={heading} tabIndex={-1} className="text-3xl font-semibold leading-[1.05] tracking-[-0.03em] focus-visible:!outline-none md:text-4xl">
            {meta.title}
          </h1>
          <p className="mt-3 max-w-[38rem] text-ink/75">{meta.lead}</p>

          <div className="mt-7 rounded-3xl border border-ink/10 bg-frost-50 p-5 md:p-8">
            {step === 0 && <IdentityStep {...common} />}
            {step === 1 && <DeviceStep {...common} />}
            {step === 2 && <ConditionStep {...common} />}
            {step === 3 && <TestStep {...common} />}
            {step === 4 && <PhotosStep {...common} photos={photos} setPhoto={setPhoto} />}
            {step === 5 && <PriceStep {...common} />}
            {step === 6 && <ReviewStep {...common} goTo={goTo} photoCount={photoCount} />}
          </div>

          <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <button type="button" onClick={() => goTo(step - 1)} className="btn btn-quiet">Back</button>
            ) : (
              <span />
            )}
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-4">
              <p id="still-needed" aria-live="polite" className="max-w-[22rem] text-sm text-ink/70 sm:text-right">
                {errorCount ? `Still needed: ${missing.map((k) => FIELD_LABELS[k] ?? k).join(", ")}.` : ""}
              </p>
              <button type="button" onClick={next} disabled={errorCount > 0} aria-describedby="still-needed" className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                {step === STEPS.length - 1 ? "Publish listing" : `Continue to ${STEPS[step + 1].label.toLowerCase()}`}
              </button>
            </div>
          </div>
        </section>

        <aside aria-label="Live preview" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="mb-3 text-sm font-medium text-ink/70">What buyers will see</p>
            <ListingPreview draft={draft} photos={photos} />
          </div>
        </aside>
      </div>

      <details className="mt-10 lg:hidden">
        <summary className="cursor-pointer rounded-2xl border border-ink/15 px-4 py-3 text-sm font-medium">Preview your listing</summary>
        <div className="mt-4"><ListingPreview draft={draft} photos={photos} /></div>
      </details>

      {/* dialogs */}
      <Dialog
        open={modal === "restore"}
        onClose={() => { setModal(null); setReady(true); }}
        closeOnBackdrop={false}
        title="Continue your draft?"
        description={pending.current ? `You started listing ${deviceTitle(pending.current.draft) || "a phone"} earlier. Pick up where you stopped, or start fresh.` : ""}
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-quiet" onClick={() => { reset(); setModal(null); setReady(true); }}>Start over</button>
          <button
            type="button"
            data-autofocus
            className="btn btn-primary"
            onClick={() => {
              const s = pending.current!;
              setDraft({ ...EMPTY_DRAFT, ...s.draft });
              setStep(s.step);
              setMaxStep(s.maxStep);
              setModal(null);
              setReady(true);
              toast(s.step >= 4 ? "Draft restored. Photos are not saved, so add them again." : "Draft restored.", { kind: "success" });
            }}
          >
            Continue draft
          </button>
        </div>
      </Dialog>

      <Dialog
        open={modal === "exit"}
        onClose={() => setModal(null)}
        title="Leave the listing page?"
        description="Your answers are saved on this device, so you can come back to this step later. Photos are not saved."
      >
        <div className="flex flex-col gap-3">
          <button
            type="button"
            data-autofocus
            className="btn btn-primary"
            onClick={() => {
              saveNow();
              setModal(null);
              router.push("/");
              toast("Draft saved. Continue any time with Sell a phone.", { kind: "success" });
            }}
          >
            Save draft and exit
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => setModal(null)}>Keep editing</button>
          {isDirty(draft) && (
            <button type="button" className="mt-1 self-center rounded-lg px-3 py-1.5 text-sm font-medium text-crack hover:bg-crack/10" onClick={() => setModal("discard")}>
              Discard this draft
            </button>
          )}
        </div>
      </Dialog>

      <Dialog open={modal === "discard"} onClose={() => setModal("exit")} title="Discard this draft?" description="Everything you entered on this page will be cleared. You will have a few seconds to undo it.">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn border border-crack text-crack hover:bg-crack/10" onClick={discard}>Discard draft</button>
          <button type="button" data-autofocus className="btn btn-primary" onClick={() => setModal(null)}>Keep my draft</button>
        </div>
      </Dialog>

      <PublishDialog
        open={modal === "publish"}
        title={deviceTitle(draft)}
        price={rs(Number(draft.price))}
        onCancel={() => setModal(null)}
        onDone={() => {
          const id = `MTX-${Math.floor(10000 + Math.random() * 89999)}`;
          try { localStorage.removeItem(DRAFT_KEY); } catch {}
          setModal(null);
          setPublished({ id, title: deviceTitle(draft), price: Number(draft.price) });
          toast("Listing published. You can edit or take it down any time.", {
            kind: "success",
            action: { label: "Undo", onClick: () => toast("Listing taken down. Your answers are kept.") },
          });
        }}
      />
    </Shell>
  );
}

/** confirm -> progress -> done, like the old sell dialog, but at the end of the flow. */
function PublishDialog({ open, title, price, onCancel, onDone }: { open: boolean; title: string; price: string; onCancel: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (open) {
      setRunning(false);
      setCursor(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !running) return;
    const id = setTimeout(() => {
      if (cursor + 1 >= PUBLISH_STAGES.length) onDone();
      else setCursor(cursor + 1);
    }, 1100);
    return () => clearTimeout(id);
  }, [open, running, cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  const cancel = () => {
    onCancel();
    if (running) toast("Publishing cancelled. Nothing was published.");
  };

  return (
    <Dialog
      open={open}
      onClose={cancel}
      closeOnBackdrop={!running}
      title={running ? "Publishing your listing" : "Publish this listing?"}
      description={running ? `Step ${cursor + 1} of ${PUBLISH_STAGES.length}. Keep this window open.` : `${title} for ${price} will be visible to buyers straight away. Your CNIC and number stay private.`}
    >
      {running ? (
        <>
          <ProgressBar value={((cursor + 1) / PUBLISH_STAGES.length) * 100} label="Publishing progress" slow />
          <div className="mt-5"><StageList items={PUBLISH_STAGES} cursor={cursor} /></div>
          <div className="mt-6 flex justify-end"><button type="button" data-autofocus className="btn btn-quiet" onClick={cancel}>Cancel</button></div>
        </>
      ) : (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-quiet" onClick={onCancel}>Not yet</button>
          <button type="button" data-autofocus className="btn btn-primary" onClick={() => setRunning(true)}>Yes, publish</button>
        </div>
      )}
    </Dialog>
  );
}

function Shell({
  children,
  savedAt,
  onExit,
  exitLabel,
  progress,
  onLogo,
  stepLabel,
}: {
  children: React.ReactNode;
  savedAt: number | null;
  onExit: () => void;
  exitLabel: string;
  progress: number;
  onLogo?: () => void;
  stepLabel?: string;
}) {
  return (
    <div className="min-h-svh bg-frost">
      <Header
        variant="sell"
        progress={progress}
        onLogo={onLogo}
        action={{ label: exitLabel, onClick: onExit }}
        status={
          <p aria-live="polite" className="hidden items-center gap-1.5 text-sm text-ink/65 md:flex">
            {savedAt ? <><Check size={13} /> Draft saved</> : stepLabel}
          </p>
        }
      />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-28 md:px-6 md:pt-32">{children}</main>
    </div>
  );
}
