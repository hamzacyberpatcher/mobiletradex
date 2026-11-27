"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Dialog from "@/components/Dialog";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useToast } from "@/components/ToastProvider";
import { ProgressBar } from "@/components/listing/ui";
import { phoneBrands, ptaOptions } from "@/data/listing";
import { listings, type Listing } from "@/data/listings";
import { chipsOf, DEFAULT_FILTERS, run, sortOptions, tokens, valueTag, type Filters, type Sort } from "@/lib/browse";
import { rs } from "@/lib/listing";
import FilterPanel from "./FilterPanel";
import ListingCard, { CardSkeleton } from "./ListingCard";
import RecentStrip from "./RecentStrip";
import ShortcutsDialog from "./ShortcutsDialog";
import { GradeChip, Icon, ICONS, payLabel, useRecent, useSaved } from "./ui";

const KEY = "mtx-browse";
const PAGE = 12;
const MAX_COMPARE = 3;
const brandName = (slug: string) => phoneBrands.find((b) => b.slug === slug)?.name ?? slug;
const SUGGESTIONS = ["iPhone 13 128GB", "Samsung under 60000", "PTA approved Redmi", "Pixel", "Lahore Verified"];

export default function BrowseApp() {
  const { toast } = useToast();
  const { saved, toggle: toggleSaved } = useSaved();
  const { recent, restore: restoreRecent, clear: clearRecent } = useRecent();
  const [keys, setKeys] = useState(false);
  const [f, setF] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<Sort>("best");
  const [shown, setShown] = useState(PAGE);
  const [busy, setBusy] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const moreTimer = useRef<number>(0);
  const [drawer, setDrawer] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const ready = useRef(false);
  const timer = useRef<number>(0);
  const [qText, setQText] = useState("");

  // restore filters after Back from a listing, then drop the first skeleton
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setF({ ...DEFAULT_FILTERS, ...s.f });
        setQText(s.f?.q ?? "");
        if (s.sort) setSort(s.sort);
      }
    } catch {}
    ready.current = true;
    timer.current = window.setTimeout(() => setBusy(false), 450);
    return () => clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ f, sort }));
    } catch {}
  }, [f, sort]);

  /** Any change to what is shown gives a short loading state so the result change is visible. */
  const refresh = useCallback(() => {
    setShown(PAGE);
    clearTimeout(moreTimer.current);
    setLoadingMore(false);
    setBusy(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setBusy(false), 320);
  }, []);

  const apply = useCallback((patch: Partial<Filters>) => {
    setF((x) => ({ ...x, ...patch }));
    if (patch.q !== undefined) setQText(patch.q);
    refresh();
  }, [refresh]);

  // debounce the search box so typing does not flash skeletons
  useEffect(() => {
    if (qText === f.q) return;
    const id = window.setTimeout(() => apply({ q: qText }), 250);
    return () => clearTimeout(id);
  }, [qText, f.q, apply]);

  const words = useMemo(() => tokens(f.q), [f.q]);
  const results = useMemo(() => run(listings, f, sort, saved), [f, sort, saved]);
  const chips = useMemo(() => chipsOf(f, brandName), [f]);
  const visible = results.slice(0, shown);
  const recentItems = recent.map((id) => listings.find((l) => l.id === id)).filter(Boolean) as Listing[];

  // keyboard shortcuts for frequent buyers; ignored while typing or when a dialog is open
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable || document.querySelector("[role=dialog]")) return;
      if (e.key === "/") { e.preventDefault(); document.getElementById("q")?.focus(); }
      else if (e.key === "?") setKeys(true);
      else if (e.key === "f") {
        if (window.matchMedia("(min-width: 1024px)").matches) document.querySelector<HTMLElement>("aside[aria-label=Filters] summary")?.focus();
        else setDrawer(true);
      } else if (e.key === "s") apply({ savedOnly: !f.savedOnly });
      else if (e.key === "c" && compare.length >= 2) setCompareOpen(true);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [apply, f.savedOnly, compare.length]);
  const selected = listings.filter((l) => compare.includes(l.id));

  /** For an empty result: which single filter, if removed, brings back the most phones. */
  const loosen = useMemo(() => {
    if (results.length) return [];
    return chipsOf(f, brandName, true)
      .map((c) => ({ c, n: run(listings, c.clear(f), sort, saved).length }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 3);
  }, [results.length, f, sort, saved]);

  const clearAll = () => {
    const prev = f;
    const prevQ = qText;
    setQText("");
    apply({ ...DEFAULT_FILTERS });
    toast("All filters cleared.", {
      action: { label: "Undo", onClick: () => { setQText(prevQ); apply(prev); } },
    });
  };

  const removeChip = (key: string) => {
    const c = chips.find((x) => x.key === key);
    if (c) apply(c.clear(f));
  };

  const onSave = (l: Listing) => {
    const was = saved.includes(l.id);
    toggleSaved(l.id);
    toast(was ? `Removed ${l.title} from saved phones.` : `Saved ${l.title}. Find it under Saved phones.`, {
      kind: "success",
      action: { label: "Undo", onClick: () => toggleSaved(l.id) },
    });
  };

  const onCompare = (l: Listing) => {
    if (compare.includes(l.id)) return setCompare(compare.filter((x) => x !== l.id));
    if (compare.length >= MAX_COMPARE) return toast(`You can compare up to ${MAX_COMPARE} phones. Remove one first.`, { kind: "error" });
    setCompare([...compare, l.id]);
  };

  const inFilters = chips.length + (f.q ? 1 : 0);
  const hasMore = results.length > shown;

  // infinite scroll: load the next page when the end of the grid comes into view
  useEffect(() => {
    const el = sentinel.current;
    if (!el || busy || loadingMore || !hasMore) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setLoadingMore(true);
        moreTimer.current = window.setTimeout(() => {
          setShown((n) => n + PAGE);
          setLoadingMore(false);
        }, 600);
      },
      { rootMargin: "0px 0px 300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [busy, loadingMore, hasMore, shown]);
  useEffect(() => () => clearTimeout(moreTimer.current), []);

  return (
    <div className="min-h-svh bg-frost">
      <Header variant="browse" />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-28 md:px-6 md:pt-32">
        <div className="max-w-3xl">
          <h1 className="h-section">Find a phone you can trust</h1>
          <p className="mt-3 text-lg leading-relaxed text-ink/75">
            Every listing shows its condition and defects first, a hardware report, and a seller who has verified their CNIC.
          </p>
        </div>

        {/* search */}
        <form role="search" onSubmit={(e) => { e.preventDefault(); apply({ q: qText }); }} className="mt-8">
          <label htmlFor="q" className="sr-only">Search phones</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/55"><Icon d={ICONS.search} size={20} /></span>
            <input
              id="q"
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape" && qText) { e.preventDefault(); setQText(""); } }}
              placeholder="Search by model, storage, city or condition, for example: iPhone 13 128GB Lahore"
              autoComplete="off"
              className="w-full rounded-2xl border border-ink/20 bg-frost-50 py-4 pl-12 pr-12 text-base text-ink placeholder:text-ink/45 hover:border-ink/40 focus:border-deep focus:outline-none focus:ring-2 focus:ring-deep/30"
            />
            {qText && (
              <button type="button" aria-label="Clear search" onClick={() => setQText("")} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-ink/60 hover:bg-ink/10 hover:text-ink">
                <Icon d={ICONS.x} size={16} />
              </button>
            )}
          </div>
          {!qText && (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink/70">
              Try
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setQText(s)} className="rounded-full border border-ink/20 px-3 py-1 font-medium text-ink hover:border-ink/45 hover:bg-ink/5">
                  {s}
                </button>
              ))}
            </p>
          )}
        </form>

        <div className="mt-8 grid gap-8 lg:grid-cols-[19rem_minmax(0,1fr)]">
          {/* filters, desktop */}
          <aside aria-label="Filters" className="hidden lg:block">
            <div data-lenis-prevent className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto overscroll-contain rounded-3xl border border-ink/10 bg-frost-50 px-5 py-2">
              <div className="flex items-center justify-between border-b border-ink/10 py-3">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button type="button" onClick={clearAll} disabled={!inFilters} className="text-sm font-medium text-deep underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-ink/40 disabled:no-underline">
                  Clear all
                </button>
              </div>
              <FilterPanel f={f} set={apply} />
            </div>
          </aside>

          <section aria-label="Results" aria-busy={busy}>
            {/* result bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p role="status" className="text-[0.95rem] font-medium">
                {busy ? "Updating results" : `${results.length} ${results.length === 1 ? "phone" : "phones"}`}
                {!busy && words.length > 0 && <span className="font-normal text-ink/70"> matching &ldquo;{f.q}&rdquo;</span>}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setKeys(true)} className="btn btn-quiet hidden whitespace-nowrap !px-4 !py-2 text-sm md:inline-flex" aria-label="Keyboard shortcuts">
                  <kbd className="font-mono">?</kbd><span className="ml-2">Shortcuts</span>
                </button>
                <button type="button" onClick={() => apply({ savedOnly: !f.savedOnly })} aria-pressed={f.savedOnly} className={`btn whitespace-nowrap !px-4 !py-2 text-sm ${f.savedOnly ? "btn-primary" : "btn-quiet"}`}>
                  <Icon d={ICONS.heart} size={15} fill={f.savedOnly} />
                  <span className="ml-2">Saved ({saved.length})</span>
                </button>
                <button type="button" onClick={() => setDrawer(true)} className="btn btn-quiet whitespace-nowrap !px-4 !py-2 text-sm lg:hidden">
                  <Icon d={ICONS.filter} size={15} />
                  <span className="ml-2">Filters{chips.length ? ` (${chips.length})` : ""}</span>
                </button>
                <label className="flex items-center gap-2 text-sm">
                  <span className="sr-only sm:not-sr-only text-ink/70">Sort</span>
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value as Sort); refresh(); }}
                    className="rounded-full border border-ink/25 bg-frost-50 px-4 py-2 text-sm font-medium text-ink hover:border-ink/45 focus:border-deep focus:outline-none focus:ring-2 focus:ring-deep/30"
                  >
                    {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
              </div>
            </div>

            {chips.length > 0 && (
              <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
                {chips.map((c) => (
                  <li key={c.key}>
                    <button type="button" onClick={() => removeChip(c.key)} className="inline-flex items-center gap-1.5 rounded-full border border-deep bg-deep/10 py-1 pl-3 pr-2 text-sm font-medium hover:bg-deep/20">
                      {c.label}
                      <span className="sr-only">, remove filter</span>
                      <Icon d={ICONS.x} size={13} />
                    </button>
                  </li>
                ))}
                <li><button type="button" onClick={clearAll} className="px-2 text-sm font-medium text-deep underline-offset-4 hover:underline lg:hidden">Clear all</button></li>
              </ul>
            )}

            {recentItems.length > 0 && !f.q && (
              <div className="mt-6">
                <RecentStrip
                  items={recentItems}
                  onClear={() => {
                    const prev = recent;
                    clearRecent();
                    toast("Viewing history cleared.", { action: { label: "Undo", onClick: () => restoreRecent(prev) } });
                  }}
                />
              </div>
            )}

            {/* grid */}
            <div className="mt-6">
              {busy ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
                </div>
              ) : results.length === 0 ? (
                <div className="rounded-3xl border border-ink/10 bg-frost-50 p-8 text-center md:p-12">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-ink/20 text-ink/70"><Icon d={ICONS.search} size={24} /></span>
                  <h2 className="mt-5 text-2xl font-semibold tracking-[-0.02em]">No phones match these filters</h2>
                  <p className="mx-auto mt-2 max-w-md text-ink/75">
                    {f.savedOnly && !saved.length ? "You have not saved any phones yet. Tap the heart on a listing to keep it here." : "Loosen one filter to see more phones."}
                  </p>
                  {loosen.length > 0 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {loosen.map(({ c, n }) => (
                        <button key={c.key} type="button" onClick={() => apply(c.clear(f))} className="rounded-full border border-ink/25 px-4 py-2 text-sm font-medium hover:border-ink/50 hover:bg-ink/5">
                          Remove &ldquo;{c.label}&rdquo; to see {n} {n === 1 ? "phone" : "phones"}
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={clearAll} className="btn btn-primary mt-6">Clear all filters</button>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map(({ l }) => (
                      <ListingCard
                        key={l.id}
                        l={l}
                        words={words}
                        saved={saved.includes(l.id)}
                        onSave={() => onSave(l)}
                        compared={compare.includes(l.id)}
                        onCompare={() => onCompare(l)}
                      />
                    ))}
                  </div>
                  {loadingMore && (
                    <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}
                    </div>
                  )}
                  {/* reaching this marker loads the next phones, so there is no button to press */}
                  <div ref={sentinel} aria-hidden className="h-px" />
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <p role="status" className="text-sm text-ink/70">
                      {loadingMore ? "Loading more phones" : hasMore ? `Showing ${visible.length} of ${results.length}` : `You have seen all ${results.length} ${results.length === 1 ? "phone" : "phones"}`}
                    </p>
                    <div className="w-48"><ProgressBar value={(visible.length / results.length) * 100} label="Results shown" /></div>
                    {!hasMore && results.length > PAGE && (
                      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="btn btn-quiet">Back to top</button>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* compare bar */}
      {compare.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div role="region" aria-label="Compare phones" className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-ink/10 bg-frost-50/90 p-3 pl-5 shadow-[0_20px_50px_-20px_rgba(14,24,33,0.6)] backdrop-blur-[24px]">
            <p className="min-w-0 flex-1 truncate text-sm font-medium">
              {compare.length} of {MAX_COMPARE} selected
              <span className="block truncate font-normal text-ink/70">{selected.map((l) => l.title).join(", ")}</span>
            </p>
            <button type="button" onClick={() => setCompare([])} className="px-2 text-sm font-medium text-ink/70 hover:text-ink">Clear</button>
            <button type="button" disabled={compare.length < 2} onClick={() => setCompareOpen(true)} className="btn btn-primary !px-5 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
              {compare.length < 2 ? "Pick one more" : "Compare"}
            </button>
          </div>
        </div>
      )}

      {/* mobile filters */}
      <Dialog open={drawer} onClose={() => setDrawer(false)} title="Filters" description={`${results.length} ${results.length === 1 ? "phone matches" : "phones match"} right now.`}>
        <div data-lenis-prevent className="-mx-2 max-h-[55svh] overflow-y-auto px-2">
          <FilterPanel f={f} set={apply} />
        </div>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-quiet" onClick={clearAll} disabled={!inFilters}>Clear all</button>
          <button type="button" className="btn btn-primary" onClick={() => setDrawer(false)} data-autofocus>
            Show {results.length} {results.length === 1 ? "phone" : "phones"}
          </button>
        </div>
      </Dialog>

      <ShortcutsDialog open={keys} onClose={() => setKeys(false)} />
      <CompareDialog open={compareOpen} onClose={() => setCompareOpen(false)} items={selected} onRemove={(id) => { const next = compare.filter((x) => x !== id); setCompare(next); if (next.length < 2) setCompareOpen(false); }} />
      <Footer />
    </div>
  );
}

function CompareDialog({ open, onClose, items, onRemove }: { open: boolean; onClose: () => void; items: Listing[]; onRemove: (id: string) => void }) {
  const cheapest = Math.min(...items.map((l) => l.price));
  const bestBattery = Math.max(...items.map((l) => l.battery));
  const pta = (v: string) => ptaOptions.find((p) => p.value === v)?.label ?? v;
  /* order follows the listing: name, specs, condition, price */
  const rows: { label: string; cell: (l: Listing) => React.ReactNode }[] = [
    { label: "Storage and RAM", cell: (l) => `${l.storage}, ${l.ram}` },
    { label: "PTA status", cell: (l) => pta(l.pta) },
    { label: "Condition", cell: (l) => <GradeChip grade={l.grade} /> },
    { label: "Defects", cell: (l) => (l.defects.length ? <ul className="space-y-1">{l.defects.map((d) => <li key={d}>{d}</li>)}</ul> : "None reported") },
    { label: "Battery health", cell: (l) => <span className={l.battery === bestBattery ? "font-semibold text-deep" : ""}>{l.battery}%{l.battery === bestBattery && items.length > 1 ? ", best" : ""}</span> },
    { label: "Hardware report", cell: (l) => (l.score !== null ? `Score ${l.score} of 100` : "Not tested yet") },
    { label: "Payment", cell: (l) => payLabel[l.payment] },
    { label: "Price", cell: (l) => <span className={`text-lg font-semibold ${l.price === cheapest ? "text-deep" : ""}`}>{rs(l.price)}{l.price === cheapest && items.length > 1 ? <span className="block text-xs font-medium">Lowest</span> : null}</span> },
    { label: "Against fair value", cell: (l) => valueTag(l.price, l.fair).label },
  ];
  return (
    <Dialog open={open} onClose={onClose} wide title="Compare phones" description="Details sit in the same order as on every listing: name, specs, condition, then price.">
      <div data-lenis-prevent className="-mx-2 max-h-[60svh] overflow-auto px-2">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="w-32 p-2 align-bottom"><span className="sr-only">Detail</span></th>
              {items.map((l) => (
                <th key={l.id} className="p-2 align-top">
                  <p className="text-base font-semibold">{l.title}</p>
                  <button type="button" onClick={() => onRemove(l.id)} className="mt-1 text-xs font-medium text-deep underline-offset-4 hover:underline">Remove</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-ink/10">
                <th scope="row" className="p-2 align-top font-medium text-ink/70">{r.label}</th>
                {items.map((l) => <td key={l.id} className="p-2 align-top">{r.cell(l)}</td>)}
              </tr>
            ))}
            <tr className="border-t border-ink/10">
              <td />
              {items.map((l) => (
                <td key={l.id} className="p-2">
                  <a href={`/browse/${l.id}`} className="btn btn-quiet !px-4 !py-2 text-sm">View listing</a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}
