"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * Message boxes (toasts). Every action that changes something gives feedback
 * (Shneiderman 3, Nielsen 1) and, where it makes sense, an Undo button
 * (Shneiderman 6, Nielsen 3). Toasts sit in an aria-live region so screen
 * readers announce them, pause while hovered or focused, and never block the page.
 */

export type ToastKind = "success" | "info" | "error";

export type ToastOptions = {
  kind?: ToastKind;
  /** label + handler for a single reversal / follow-up button */
  action?: { label: string; onClick: () => void };
  /** ms before auto-dismiss; default 6000 */
  duration?: number;
};

type Toast = ToastOptions & { id: number; message: string };
type Ctx = { toast: (message: string, opts?: ToastOptions) => void };

const ToastContext = createContext<Ctx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const ICON: Record<ToastKind, string> = {
  success: "M5 12.5l4.2 4.2L19 7",
  info: "M12 8v.01M12 11.5V17",
  error: "M12 7v6M12 16.5v.01",
};

function ToastCard({ t, onClose }: { t: Toast; onClose: () => void }) {
  const [paused, setPaused] = useState(false);
  const left = useRef(t.duration ?? 6000);
  const started = useRef(0);

  useEffect(() => {
    if (paused) return;
    started.current = performance.now();
    const id = setTimeout(onClose, left.current);
    return () => {
      clearTimeout(id);
      left.current -= performance.now() - started.current;
    };
  }, [paused, onClose]);

  const kind = t.kind ?? "info";
  const tone =
    kind === "error" ? "text-crack" : kind === "success" ? "text-brand dark:text-steel" : "text-ink";

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex w-[min(26rem,calc(100vw-2rem))] animate-toast-in items-center gap-3 rounded-2xl border border-ink/10 bg-frost-50/95 py-2.5 pl-3 pr-2 text-sm text-ink shadow-[0_12px_40px_-12px_rgba(14,24,33,0.45)] backdrop-blur-xl motion-reduce:animate-none"
    >
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current ${tone}`} aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d={ICON[kind]} />
        </svg>
      </span>
      <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
      {t.action && (
        <button
          type="button"
          onClick={() => {
            t.action!.onClick();
            onClose();
          }}
          className="shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-brand underline-offset-2 hover:bg-ink/10 hover:underline dark:text-steel"
        >
          {t.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss message"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/60 hover:bg-ink/10 hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const close = useCallback((id: number) => setToasts((all) => all.filter((x) => x.id !== id)), []);

  const toast = useCallback((message: string, opts: ToastOptions = {}) => {
    const id = ++seq.current;
    // keep at most three on screen; newest replaces the oldest
    setToasts((all) => [...all.slice(-2), { ...opts, id, message }]);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} t={t} onClose={() => close(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
