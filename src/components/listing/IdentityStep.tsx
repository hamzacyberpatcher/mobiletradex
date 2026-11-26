"use client";

import { useEffect, useRef, useState } from "react";
import { check, digits, formatCnic, formatPhone } from "@/lib/listing";
import { useToast } from "@/components/ToastProvider";
import { Callout, Check, Field, ProgressBar, StageList, inputCls } from "./ui";
import type { StepProps } from "./types";

type Phase = "form" | "checking" | "otp" | "confirming" | "failed";

const CHECKS = [
  { label: "Reading your CNIC number" },
  { label: "Matching it with the NADRA record" },
  { label: "Confirming the name on the record" },
];
const STAGE_MS = 1000;
/** Prototype only: any CNIC starting 11111 simulates a name mismatch; the OTP is always 123456. */
const DEMO_OTP = "123456";

export default function IdentityStep({ draft, set, errors, hints }: StepProps) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("form");
  const [cursor, setCursor] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // advance through the NADRA check one stage at a time
  useEffect(() => {
    if (phase !== "checking") return;
    timer.current = setTimeout(() => {
      if (cursor + 1 < CHECKS.length) return setCursor(cursor + 1);
      if (digits(draft.cnic).startsWith("11111")) setPhase("failed");
      else {
        setPhase("otp");
        toast(`We sent a 6-digit code to ${draft.phone}.`);
      }
    }, STAGE_MS);
    return () => clearTimeout(timer.current);
  }, [phase, cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  const formOk = check.cnic(draft.cnic).ok && check.phone(draft.phone).ok && check.name(draft.name).ok;
  const start = () => {
    setCursor(0);
    setOtp("");
    setOtpError("");
    setPhase("checking");
  };

  const confirmOtp = () => {
    if (otp !== DEMO_OTP) {
      setOtpError("That code is not right. Check the SMS and try again.");
      return;
    }
    setPhase("confirming");
    timer.current = setTimeout(() => {
      set({ idVerified: true });
      setPhase("form");
      toast("Identity verified. Your CNIC stays private.", { kind: "success" });
    }, 900);
  };

  if (draft.idVerified) {
    return (
      <div className="space-y-5">
        <Callout
          kind="success"
          title="CNIC and mobile number verified"
          action={
            <button
              type="button"
              className="btn btn-quiet !px-4 !py-1.5 text-sm"
              onClick={() => {
                set({ idVerified: false });
                toast("Verification cleared. Check your details and verify again.");
              }}
            >
              Change details
            </button>
          }
        >
          {draft.name} · CNIC •••••-•••{digits(draft.cnic).slice(8, 12)}-{digits(draft.cnic).slice(12)} · {draft.phone}
        </Callout>
        <PrivacyNote />
      </div>
    );
  }

  const locked = phase !== "form" && phase !== "failed";

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Full name" hint={hints.name ?? "Exactly as printed on your CNIC."} error={errors.name}>
            {(p) => (
              <input {...p} className={inputCls(!!errors.name)} autoComplete="name" value={draft.name} disabled={locked} placeholder="Ayesha Siddiqui" onChange={(e) => set({ name: e.target.value })} />
            )}
          </Field>
        </div>
        <Field label="CNIC number" hint={hints.cnic ?? "13 digits. Never shown to buyers."} error={errors.cnic}>
          {(p) => (
            <input {...p} className={`${inputCls(!!errors.cnic)} font-mono tracking-wide`} inputMode="numeric" autoComplete="off" value={draft.cnic} disabled={locked} placeholder="35202-1234567-1" onChange={(e) => set({ cnic: formatCnic(e.target.value) })} />
          )}
        </Field>
        <Field label="Mobile number" hint={hints.phone ?? "We send a one-time code to this number."} error={errors.phone}>
          {(p) => (
            <input {...p} className={`${inputCls(!!errors.phone)} font-mono tracking-wide`} inputMode="tel" autoComplete="tel" value={draft.phone} disabled={locked} placeholder="0300-1234567" onChange={(e) => set({ phone: formatPhone(e.target.value) })} />
          )}
        </Field>
      </div>

      {phase === "failed" && (
        <Callout
          kind="error"
          title="We could not match this CNIC with the name entered"
          action={
            <button type="button" className="btn btn-quiet !px-4 !py-1.5 text-sm" onClick={() => setPhase("form")}>
              Edit details
            </button>
          }
        >
          Check that the name and the 13 digits match your card exactly. If it still fails, visit any NADRA e-Sahulat centre to update your record.
        </Callout>
      )}

      {(phase === "checking" || phase === "confirming") && (
        <div className="rounded-2xl border border-ink/10 p-4" aria-live="polite">
          <p className="mb-3 text-sm font-semibold">{phase === "checking" ? "Checking with NADRA" : "Confirming your code"}</p>
          <ProgressBar value={phase === "confirming" ? 100 : ((cursor + 1) / CHECKS.length) * 100} label="Identity check progress" slow />
          <div className="mt-4">
            <StageList items={phase === "confirming" ? CHECKS.map((c) => ({ ...c })) : CHECKS} cursor={phase === "confirming" ? CHECKS.length : cursor} />
          </div>
        </div>
      )}

      {phase === "otp" && (
        <div className="rounded-2xl border border-ink/10 p-4">
          <Field label="6-digit code" hint={otp && otp.length < 6 ? `${otp.length} of 6 digits` : `Sent to ${draft.phone}. Prototype: use ${DEMO_OTP}.`} error={otpError}>
            {(p) => (
              <div className="flex gap-3">
                <input
                  {...p}
                  className={`${inputCls(!!otpError)} max-w-[11rem] font-mono text-lg tracking-[0.35em]`}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  autoFocus
                  onChange={(e) => {
                    setOtp(digits(e.target.value));
                    setOtpError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && otp.length === 6 && confirmOtp()}
                />
                <button type="button" className="btn btn-primary" disabled={otp.length !== 6} onClick={confirmOtp}>
                  Confirm
                </button>
              </div>
            )}
          </Field>
          <button type="button" className="mt-3 text-sm font-medium text-deep underline-offset-2 hover:underline" onClick={() => toast("A new code is on its way.")}>
            Send the code again
          </button>
        </div>
      )}

      {!locked && (
        <div className="space-y-2">
          <button type="button" onClick={start} disabled={!formOk} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">
            Verify with NADRA
          </button>
          {!formOk && <p className="text-sm text-ink/65">Fill in all three fields to start the check.</p>}
          <p className="text-xs text-ink/55">
            Prototype: a CNIC starting 11111 simulates a mismatch; any other 13 digits pass.
          </p>
        </div>
      )}
      <PrivacyNote />
    </div>
  );
}

function PrivacyNote() {
  return (
    <p className="flex items-start gap-2 text-sm text-ink/70">
      <span className="mt-0.5 text-deep"><Check size={14} /></span>
      Your CNIC is encrypted, used once to confirm you are a real person, and never appears on your listing.
    </p>
  );
}
