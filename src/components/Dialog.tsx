"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Modal dialog box. Applies:
 *  - Shneiderman 5 / Mandel: one clear question, a primary and a safe secondary choice
 *  - Nielsen 3: Escape, the close button and the backdrop all give a way out
 *  - Norman: focus moves in, is trapped, and returns to the trigger on close
 */
export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  closeOnBackdrop = true,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
  /** roomier box for photos and other media */
  wide?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        box.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    (box.current?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0] ?? box.current)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
      } else if (e.key === "Tab") {
        const list = focusables();
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      returnTo?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto overscroll-contain bg-night/60 p-4 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        aria-describedby={description ? "dlg-desc" : undefined}
        tabIndex={-1}
        className={`relative w-full ${wide ? "max-w-3xl" : "max-w-[30rem]"} animate-dialog-in rounded-3xl border border-ink/10 bg-frost-50 p-6 text-ink shadow-[0_30px_80px_-20px_rgba(14,24,33,0.6)] outline-none motion-reduce:animate-none md:p-8`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl text-ink/60 hover:bg-ink/10 hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h2 id="dlg-title" className="pr-8 text-2xl font-semibold leading-tight tracking-[-0.02em]">
          {title}
        </h2>
        {description && (
          <p id="dlg-desc" className="mt-2 text-[0.95rem] leading-relaxed text-ink/75">
            {description}
          </p>
        )}
        <div className="mt-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
