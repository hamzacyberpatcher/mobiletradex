"use client";

import Dialog from "@/components/Dialog";

export const SHORTCUTS: [string, string][] = [
  ["/", "Jump to search"],
  ["f", "Jump to filters"],
  ["s", "Show or hide saved phones"],
  ["c", "Compare the selected phones"],
  ["Esc", "Clear the search box while typing in it"],
  ["?", "Open this list"],
];

/** Shortcuts for frequent buyers (Shneiderman 2). Everything also works with the mouse. */
export default function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Keyboard shortcuts" description="Optional, for people who browse a lot. Every action also has a button.">
      <dl className="divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-frost px-4">
        {SHORTCUTS.map(([k, d]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[0.95rem]">{d}</dt>
            <dd><kbd className="rounded-lg border border-ink/25 bg-frost-50 px-2.5 py-1 font-mono text-sm">{k}</kbd></dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex justify-end">
        <button type="button" data-autofocus className="btn btn-primary" onClick={onClose}>Got it</button>
      </div>
    </Dialog>
  );
}
