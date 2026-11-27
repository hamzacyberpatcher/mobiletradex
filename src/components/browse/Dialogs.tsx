"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Dialog from "@/components/Dialog";
import { useToast } from "@/components/ToastProvider";
import { Callout, Check, Field, inputCls, ProgressBar, StageList } from "@/components/listing/ui";
import type { Listing } from "@/data/listings";
import { rs } from "@/lib/listing";

const first = (l: Listing) => l.seller.name.split(" ")[0];
const PHONE_RE = /(\+?92[\s-]?|0)3\d{2}[\s-]?\d{7}/;
const stepper = (value: number, set: (n: number) => void, done: () => void) => {
  // fake network progress: advance in thirds, then finish
  if (value >= 100) {
    const t = setTimeout(done, 250);
    return () => clearTimeout(t);
  }
  const t = setTimeout(() => set(Math.min(100, value + 34)), 350);
  return () => clearTimeout(t);
};

/* ---------------- contact ---------------- */

const TEMPLATES = [
  "Is it still available?",
  "Can you share the hardware report?",
  "Can we meet at the safe zone on Saturday?",
  "Is the price negotiable?",
];

export function ContactDialog({ l, open, onClose }: { l: Listing; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(0);
  const hidden = PHONE_RE.test(text);

  useEffect(() => {
    if (!sending) return;
    return stepper(sending, setSending, () => {
      setSending(0);
      setText("");
      onClose();
      toast(`Message sent to ${first(l)}. Replies appear in Messages.`, { kind: "success", action: { label: "Open chat", onClick: () => router.push("/chat") } });
    });
  }, [sending]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onClose={sending ? () => {} : onClose} closeOnBackdrop={!sending} title={`Message ${first(l)}`} description={`About the ${l.title}. ${first(l)} sees your name, never your phone number.`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim() && !sending) setSending(1);
        }}
        className="space-y-4"
      >
        <div className="flex flex-wrap gap-2" aria-label="Quick messages">
          {TEMPLATES.map((t) => (
            <button key={t} type="button" disabled={!!sending} onClick={() => setText(t)} className="rounded-full border border-ink/20 px-3 py-1.5 text-sm transition-colors hover:border-ink/45 hover:bg-ink/5 disabled:opacity-50">
              {t}
            </button>
          ))}
        </div>
        <Field label="Your message" hint={hidden ? undefined : "Keep the conversation here so escrow and safe meetup zones can protect you."}>
          {(p) => (
            <textarea {...p} data-autofocus rows={4} value={text} onChange={(e) => setText(e.target.value)} disabled={!!sending} placeholder={`Hi ${first(l)}, I am interested in your ${l.title}.`} className={`${inputCls()} resize-none`} />
          )}
        </Field>
        {hidden && <Callout kind="warn" title="We will hide this phone number">Phone numbers are replaced with dots before the message is sent. Payments made outside MobileTradeX are not protected.</Callout>}
        {sending > 0 && <ProgressBar value={sending} label="Sending message" slow />}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-quiet" onClick={onClose} disabled={!!sending}>Cancel</button>
          <button type="submit" className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40" disabled={!text.trim() || !!sending}>{sending ? "Sending" : "Send message"}</button>
        </div>
      </form>
    </Dialog>
  );
}

/* ---------------- offer ---------------- */

export function OfferDialog({ l, open, onClose }: { l: Listing; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [val, setVal] = useState("");
  const [pay, setPay] = useState<"escrow" | "cod">(l.payment === "cod" ? "cod" : "escrow");
  const [sending, setSending] = useState(0);
  const n = Number(val.replace(/\D/g, ""));
  const error = !n ? undefined : n > l.price ? "This is higher than the asking price. Offer the asking price or less." : n < l.price * 0.6 ? `Offers under ${rs(l.price * 0.6)} are rarely accepted for this phone.` : undefined;
  const ok = n > 0 && !error;
  const quick = [5, 10].map((p) => Math.round((l.price * (1 - p / 100)) / 500) * 500);
  const methods = (l.payment === "both" ? ["escrow", "cod"] : [l.payment]) as ("escrow" | "cod")[];

  useEffect(() => {
    if (!sending) return;
    return stepper(sending, setSending, () => {
      setSending(0);
      setVal("");
      onClose();
      toast(`Offer of ${rs(n)} sent to ${first(l)}. They usually reply within ${l.seller.replies}.`, { kind: "success", action: { label: "Open chat", onClick: () => router.push("/chat") } });
    });
  }, [sending]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onClose={sending ? () => {} : onClose} closeOnBackdrop={!sending} title={`Make an offer for the ${l.title}`} description={`Asking price ${rs(l.price)}. ${first(l)} sees your offer, never your number.`}>
      <form onSubmit={(e) => { e.preventDefault(); if (ok && !sending) setSending(1); }} className="space-y-5">
        <Field label="Your offer (Rs)" error={error} hint={!error && n ? `That is ${Math.round((n / l.price) * 100)}% of the asking price.` : "Enter the amount you are ready to pay."}>
          {(p) => (
            <input {...p} data-autofocus inputMode="numeric" value={val ? Number(val.replace(/\D/g, "")).toLocaleString("en-US") : ""} onChange={(e) => setVal(e.target.value)} placeholder={l.price.toLocaleString("en-US")} disabled={!!sending} className={inputCls(!!error)} />
          )}
        </Field>
        <div className="flex flex-wrap gap-2">
          {quick.map((q, i) => (
            <button key={q} type="button" disabled={!!sending} onClick={() => setVal(String(q))} className="rounded-full border border-ink/20 px-3 py-1.5 text-sm hover:border-ink/45 hover:bg-ink/5 disabled:opacity-50">
              {rs(q)}, {(i + 1) * 5}% off
            </button>
          ))}
        </div>
        <fieldset disabled={!!sending}>
          <legend className="mb-1.5 text-sm font-medium">How will you pay?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {methods.map((v) => (
              <label key={v} className={`cursor-pointer rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-deep/40 ${pay === v ? "border-deep bg-deep/10" : "border-ink/20 hover:border-ink/40"}`}>
                <input type="radio" name="pay" className="sr-only" checked={pay === v} onChange={() => setPay(v)} />
                <span className="block font-medium">{v === "escrow" ? "Escrow" : "Cash at meetup"}</span>
                <span className="block text-sm text-ink/70">{v === "escrow" ? "Money is held until you confirm the phone" : "Pay the seller after inspecting"}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {sending > 0 && <ProgressBar value={sending} label="Sending offer" slow />}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-quiet" onClick={onClose} disabled={!!sending}>Cancel</button>
          <button type="submit" disabled={!ok || !!sending} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40">{sending ? "Sending offer" : "Send offer"}</button>
        </div>
      </form>
    </Dialog>
  );
}

/* ---------------- escrow ---------------- */

const STEPS = [
  { t: "You pay MobileTradeX", d: "The seller is told the money is secured, but cannot touch it yet." },
  { t: "You meet at the safe zone", d: "Check the screen, cameras, IMEI and battery against the hardware report." },
  { t: "You confirm or raise a dispute", d: "You have 24 hours after the meetup. If the phone is not as described, the money comes back to you." },
  { t: "The seller is paid", d: "Funds are released as soon as you confirm the phone." },
];

const PAY_STAGES = [{ label: "Securing your payment" }, { label: "Telling the seller the phone is reserved" }, { label: "Creating your meetup plan" }];

export function EscrowDialog({ l, open, onClose }: { l: Listing; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [phase, setPhase] = useState<"explain" | "pay" | "working" | "done">("explain");
  const [agree, setAgree] = useState(false);
  const [cursor, setCursor] = useState(0);
  const fee = Math.round(l.price * 0.01);

  useEffect(() => {
    if (phase !== "working") return;
    if (cursor >= PAY_STAGES.length) {
      setPhase("done");
      toast(`${rs(l.price + fee)} is held in escrow for the ${l.title}.`, { kind: "success" });
      return;
    }
    const t = setTimeout(() => setCursor((c) => c + 1), 800);
    return () => clearTimeout(t);
  }, [phase, cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    if (phase === "working") return;
    onClose();
    setTimeout(() => { setPhase("explain"); setAgree(false); setCursor(0); }, 250);
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      closeOnBackdrop={phase !== "working"}
      title={phase === "done" ? "Payment held in escrow" : phase === "explain" ? "How escrow protects you" : `Pay for the ${l.title}`}
      description={phase === "explain" ? "Your money is held by MobileTradeX until you have checked the phone in person." : phase === "pay" ? `Held until you confirm the phone at the meetup with ${first(l)}.` : undefined}
    >
      {phase === "explain" && (
        <>
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-deep text-xs font-semibold text-frost-50">{i + 1}</span>
                <span className="text-[0.95rem] font-medium leading-snug">{s.t}<span className="block text-sm font-normal text-ink/70">{s.d}</span></span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn-quiet" onClick={close}>Not now</button>
            <button type="button" data-autofocus className="btn btn-primary" onClick={() => setPhase("pay")}>Continue to payment</button>
          </div>
        </>
      )}

      {phase === "pay" && (
        <>
          <dl className="divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-frost px-4 text-[0.95rem]">
            <div className="flex justify-between py-3"><dt className="text-ink/75">{l.title}, {l.storage}</dt><dd className="font-medium">{rs(l.price)}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-ink/75">Escrow fee (1%)</dt><dd className="font-medium">{rs(fee)}</dd></div>
            <div className="flex justify-between py-3 text-lg font-semibold"><dt>Total</dt><dd>{rs(l.price + fee)}</dd></div>
          </dl>
          <p className="mt-3 text-sm text-ink/70">Meetup: {l.meetup}, {l.city}. Prices are final here. To negotiate, make an offer instead.</p>
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-[0.95rem]">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[rgb(var(--c-deep))]" />
            I understand the money is released to the seller only after I confirm the phone.
          </label>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn-quiet" onClick={() => setPhase("explain")}>Back</button>
            <button type="button" disabled={!agree} data-autofocus className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40" onClick={() => { setCursor(0); setPhase("working"); }}>
              Pay {rs(l.price + fee)} into escrow
            </button>
          </div>
        </>
      )}

      {phase === "working" && (
        <div aria-live="polite">
          <StageList items={PAY_STAGES} cursor={cursor} />
          <div className="mt-5"><ProgressBar value={(cursor / PAY_STAGES.length) * 100} label="Payment progress" slow /></div>
        </div>
      )}

      {phase === "done" && (
        <>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-deep text-snow dark:text-night"><Check size={20} /></span>
            <p className="text-[0.95rem] text-ink/80">{first(l)} has been told the phone is reserved for you. Agree a time for the meetup in chat. Do not hand over any cash.</p>
          </div>
          <div className="mt-4"><Callout kind="info" title="Meetup">{l.meetup}, {l.city}. A verified safe zone with cameras and staff.</Callout></div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn-quiet" onClick={close}>Close</button>
            <button type="button" data-autofocus className="btn btn-primary" onClick={() => router.push("/chat")}>Plan the meetup in chat</button>
          </div>
        </>
      )}
    </Dialog>
  );
}

/* ---------------- report ---------------- */

const REASONS = ["The description does not match the phone", "Photos look copied from somewhere else", "Seller asked me to pay outside the app", "Price looks like a scam", "Something else"];

export function ReportDialog({ l, open, onClose }: { l: Listing; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [why, setWhy] = useState("");
  const [more, setMore] = useState("");
  return (
    <Dialog open={open} onClose={onClose} title="Report this listing" description="A MobileTradeX reviewer checks every report within 24 hours. The seller is not told it came from you.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!why) return;
          onClose();
          setWhy("");
          setMore("");
          toast(`Report sent for listing ${l.id}. Thank you for keeping the marketplace honest.`, { kind: "success" });
        }}
      >
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">What is wrong?</legend>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-[0.95rem] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-deep/40 ${why === r ? "border-deep bg-deep/10" : "border-ink/20 hover:border-ink/40"}`}>
                <input type="radio" name="why" className="accent-[rgb(var(--c-deep))]" checked={why === r} onChange={() => setWhy(r)} />
                {r}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Anything else we should know?" optional>
          {(p) => <textarea {...p} rows={3} value={more} onChange={(e) => setMore(e.target.value)} className={`${inputCls()} resize-none`} />}
        </Field>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-quiet" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={!why} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40">Send report</button>
        </div>
      </form>
    </Dialog>
  );
}
