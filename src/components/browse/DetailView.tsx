"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Dialog from "@/components/Dialog";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useToast } from "@/components/ToastProvider";
import EvidencePhoto from "@/components/sections/EvidencePhoto";
import Stars from "@/components/sections/Stars";
import { Callout, Check, ProgressBar } from "@/components/listing/ui";
import { accessoryOptions, ageOptions, cities, ptaOptions } from "@/data/listing";
import { listingById, listings, shotLabels, type Listing } from "@/data/listings";
import { ago, valueTag } from "@/lib/browse";
import { rs } from "@/lib/listing";
import { ContactDialog, EscrowDialog, OfferDialog, ReportDialog } from "./Dialogs";
import MeetupChecklist from "./MeetupChecklist";
import PhonePhoto from "./PhonePhoto";
import RecentStrip from "./RecentStrip";
import { Avatar, GradeChip, Icon, ICONS, NotTestedBadge, payLabel, SaveButton, useRecent, useSaved, VerifiedBadge } from "./ui";

type Dlg = null | "contact" | "offer" | "escrow" | "report";

export default function DetailView({ id }: { id: string }) {
  const l = listingById(id)!;
  const { toast } = useToast();
  const { saved, toggle } = useSaved();
  const { recent, push, restore, clear } = useRecent();
  const [dlg, setDlg] = useState<Dlg>(null);
  const [pick, setPick] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => push(l.id), [l.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const seen = recent.filter((x) => x !== l.id).map((x) => listings.find((y) => y.id === x)).filter(Boolean) as Listing[];

  const gone = l.status === "sold";
  const reserved = l.status === "reserved";
  const tag = valueTag(l.price, l.fair);
  const low = l.fair * 0.92;
  const high = l.fair * 1.08;
  const marker = Math.min(100, Math.max(0, ((l.price - low) / (high - low)) * 100));
  const shot = l.shots[pick];
  const step = (n: number) => setPick((pick + n + l.shots.length) % l.shots.length);
  const first = l.seller.name.split(" ")[0];
  const pta = ptaOptions.find((p) => p.value === l.pta);
  const age = ageOptions.find((a) => a.value === l.age)?.label;
  const box = l.accessories.map((a) => accessoryOptions.find((o) => o.value === a)?.label).filter(Boolean);
  const safeZone = cities.find((c) => c.name === l.city)?.zones.includes(l.meetup);
  const similar = listings
    .filter((x) => x.id !== l.id && x.status === "available" && (x.brand === l.brand || Math.abs(x.price - l.price) < l.price * 0.2))
    .sort((a, b) => Number(b.brand === l.brand) - Number(a.brand === l.brand) || Math.abs(a.price - l.price) - Math.abs(b.price - l.price))
    .slice(0, 4);
  const on = saved.includes(l.id);
  const onSave = () => {
    toggle(l.id);
    toast(on ? `Removed ${l.title} from saved phones.` : `Saved ${l.title}.`, { kind: "success", action: { label: "Undo", onClick: () => toggle(l.id) } });
  };
  const canEscrow = l.payment !== "cod" && l.status === "available";

  return (
    <div className="min-h-svh bg-frost">
      <Header variant="browse" />
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-28 md:px-6 md:pt-32 lg:pb-20">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink/70">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/browse" className="font-medium text-deep underline-offset-4 hover:underline">Browse</Link></li>
            <li aria-hidden>/</li>
            <li>{l.brandName}</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">{l.title}</li>
          </ol>
        </nav>

        {gone && (
          <div className="mb-6">
            <Callout kind="info" title="This phone has been sold" action={<Link href="/browse" className="btn btn-primary !px-5 !py-2 text-sm">See similar phones</Link>}>
              The listing stays up for a few days so you can compare prices. You can no longer buy or make an offer.
            </Callout>
          </div>
        )}
        {reserved && (
          <div className="mb-6">
            <Callout kind="warn" title="Reserved for another buyer">{first} has accepted an offer. You can still message them in case the deal falls through.</Callout>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-frost-50">
              <button type="button" onClick={() => setZoom(true)} aria-label={`Enlarge photo: ${shotLabels[shot]}`} className="group block aspect-[4/3] w-full cursor-zoom-in">
                <div className={`h-full w-full ${gone ? "opacity-60 saturate-50" : ""}`}>
                  <PhonePhoto color={l.color} shot={shot} cracked={l.screen === "cracked"} scuffed={l.body !== "mint"} seed={Number(l.id)} />
                </div>
                <span className="absolute bottom-3 right-3 rounded-full bg-night/70 px-2.5 py-1 text-xs font-medium text-snow opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Click to enlarge</span>
              </button>
              <div className="absolute left-3 top-3">{l.tested ? <VerifiedBadge /> : <NotTestedBadge />}</div>
              <span className="absolute right-3 top-3 rounded-full bg-night/70 px-2.5 py-1 text-xs font-medium text-snow backdrop-blur">{pick + 1} / {l.shots.length}</span>
            </div>
            <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="Photos">
              {l.shots.map((s, i) => (
                <li key={s}>
                  <button type="button" onClick={() => setPick(i)} aria-label={shotLabels[s]} aria-current={i === pick} className={`block aspect-[4/3] w-full overflow-hidden rounded-xl border transition-colors ${i === pick ? "border-deep ring-1 ring-deep" : "border-ink/10 hover:border-ink/40"}`}>
                    <PhonePhoto color={l.color} shot={s} cracked={l.screen === "cracked"} scuffed={l.body !== "mint"} seed={Number(l.id)} />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-ink/70">{shotLabels[shot]}. Photos show the phone as the seller has it today, damage included.</p>
          </div>

          {/* details, in the order the interviews asked for: name, specs, condition, price */}
          <div className="space-y-6">
            <header>
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink/70">
                <span>Listing {l.id}</span>
                <span aria-hidden>/</span>
                <span>{ago(l.days)}</span>
                <span aria-hidden>/</span>
                <span>{l.city}</span>
              </div>
              <h1 className="mt-2 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl">{l.title}</h1>
              <p className="mt-2 text-lg text-ink/75">{l.storage}, {l.ram} RAM, {l.color}</p>
            </header>

            {/* 1. specs */}
            <section aria-labelledby="specs" className="rounded-3xl border border-ink/10 bg-frost-50 p-6">
              <h2 id="specs" className="text-lg font-semibold">Specifications</h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-[0.95rem]">
                {[
                  ["Storage", l.storage],
                  ["RAM", l.ram],
                  ["Colour", l.color],
                  ["Phone age", age],
                  ["PTA status", pta?.label],
                  ["IMEI", <span key="i" className="inline-flex flex-wrap items-center gap-x-2 font-mono text-sm">{l.imei.slice(0, 4)}••••••••{l.imei.slice(-3)}<span className="inline-flex items-center gap-1 font-sans text-xs font-medium text-deep"><Check size={10} />Valid</span></span>],
                ].map(([k, v]) => (
                  <div key={String(k)}>
                    <dt className="text-sm text-ink/65">{k}</dt>
                    <dd className="mt-0.5 font-medium">{v}</dd>
                  </div>
                ))}
                <div className="col-span-2">
                  <dt className="text-sm text-ink/65">In the box</dt>
                  <dd className="mt-0.5 font-medium">{box.length ? box.join(", ") : "Phone only"}</dd>
                </div>
              </dl>
              {pta && l.pta !== "approved" && <p className="mt-4 text-sm text-ink/70">{pta.hint}.</p>}
            </section>

            {/* 2. condition, defects first */}
            <section aria-labelledby="cond" className="rounded-3xl border border-ink/10 bg-frost-50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="cond" className="text-lg font-semibold">Condition</h2>
                <GradeChip grade={l.grade} size="md" />
              </div>

              {l.defects.length ? (
                <div className="mt-4 rounded-2xl border border-crack/40 bg-crack/10 p-4">
                  <p className="text-[0.95rem] font-semibold">Known defects ({l.defects.length})</p>
                  <ul className="mt-2 space-y-2">
                    {l.defects.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-[0.95rem]">
                        <span className="mt-0.5 text-crack"><Icon d={ICONS.warn} size={16} /></span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-deep/40 bg-deep/10 p-4 text-[0.95rem] font-medium">
                  <span className="text-deep"><Icon d={ICONS.shield} size={20} /></span>
                  No defects reported by the seller{l.tested ? " or the hardware test" : ""}.
                </div>
              )}

              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-[0.95rem]">
                <div><dt className="text-sm text-ink/65">Screen</dt><dd className="mt-0.5 font-medium">{{ flawless: "Flawless", scratched: "Light scratches", cracked: "Cracked or chipped" }[l.screen]}</dd></div>
                <div><dt className="text-sm text-ink/65">Body</dt><dd className="mt-0.5 font-medium">{{ mint: "Like new", minor: "Minor marks", dents: "Dents or bent frame" }[l.body]}</dd></div>
                <div><dt className="text-sm text-ink/65">Parts</dt><dd className="mt-0.5 font-medium">{l.panel === "replaced" ? "Screen or panel replaced" : "All original parts"}</dd></div>
                <div>
                  <dt className="text-sm text-ink/65">Battery health</dt>
                  <dd className="mt-1 flex items-center gap-3 font-medium">
                    {l.battery}%
                    <span className="block w-full max-w-24"><ProgressBar value={l.battery} label={`Battery health ${l.battery}%`} /></span>
                  </dd>
                </div>
              </dl>

              <figure className="mt-5 border-t border-ink/10 pt-4">
                <figcaption className="text-sm text-ink/65">Seller&rsquo;s note</figcaption>
                <blockquote className="mt-1 text-[0.95rem] leading-relaxed text-ink/85">{l.note}</blockquote>
              </figure>
            </section>

            {/* 3. price */}
            <section aria-labelledby="price" className="rounded-3xl border border-ink/10 bg-frost-50 p-6">
              <h2 id="price" className="sr-only">Price and buying</h2>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-4xl font-semibold tracking-[-0.03em]">{rs(l.price)}</p>
                  <p className={`mt-1 text-sm font-medium ${tag.tone === "high" ? "text-crack" : tag.tone === "good" ? "text-deep" : "text-ink/75"}`}>{tag.label}</p>
                </div>
                <p className="rounded-full border border-ink/20 px-3 py-1 text-sm font-medium">{l.negotiable ? "Negotiable" : "Fixed price"}</p>
              </div>

              <div className="mt-5">
                <div className="relative h-2 rounded-full bg-ink/10" role="img" aria-label={`Fair value ${rs(l.fair)}. This phone is ${tag.label.toLowerCase()}.`}>
                  <span className="absolute inset-y-0 left-[12%] right-[12%] rounded-full bg-deep/30" />
                  <span style={{ left: `${marker}%` }} className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-frost-50 bg-brand shadow" />
                </div>
                <div className="mt-2 flex justify-between text-xs text-ink/65">
                  <span>{rs(low)}</span>
                  <span>Fair value {rs(l.fair)}</span>
                  <span>{rs(high)}</span>
                </div>
              </div>

              <ul className="mt-5 space-y-2 text-[0.95rem]">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-ink/60"><Icon d={ICONS.shield} size={16} /></span>Payment: {payLabel[l.payment]}</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-ink/60"><Icon d={ICONS.pin} size={16} /></span>Meet at {l.meetup}, {l.city}{safeZone ? ", a verified safe zone" : ""}</li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                {canEscrow && <button type="button" onClick={() => setDlg("escrow")} className="btn btn-primary">Buy with escrow</button>}
                {!gone && l.negotiable && <button type="button" onClick={() => setDlg("offer")} className="btn btn-quiet">Make an offer</button>}
                <button type="button" onClick={() => setDlg("contact")} className={`btn ${canEscrow ? "btn-quiet" : "btn-primary"}`}>
                  <Icon d={ICONS.chat} size={16} /><span className="ml-2">Chat with {first}</span>
                </button>
                <SaveButton on={on} onClick={onSave} title={l.title} className="!h-12 !w-12" />
              </div>
              {l.payment === "cod" && !gone && <p className="mt-3 text-sm text-ink/70">This seller only accepts cash at the meetup. Test the phone before you pay.</p>}
            </section>
          </div>
        </div>

        {/* below the fold */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="report" className="rounded-3xl border border-ink/10 bg-frost-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="report" className="text-lg font-semibold">Hardware inspection report</h2>
              {l.tested ? <VerifiedBadge small /> : <NotTestedBadge small />}
            </div>
            {l.tests && l.score !== null ? (
              <>
                <div className="mt-4 flex items-end gap-4">
                  <p className="text-5xl font-semibold tracking-[-0.03em]">{l.score}<span className="text-xl font-medium text-ink/60"> / 100</span></p>
                  <p className="pb-1 text-sm text-ink/70">Tested {ago(Math.max(0, l.days - 0)).toLowerCase()} in the MobileTradeX app</p>
                </div>
                <div className="mt-3"><ProgressBar value={l.score} label={`Hardware score ${l.score} of 100`} /></div>
                <ul className="mt-5 divide-y divide-ink/10">
                  {l.tests.map((t) => (
                    <li key={t.id} className="flex items-start gap-3 py-3">
                      <span aria-hidden className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${t.ok ? "border-brand bg-brand text-snow" : "border-crack text-crack"}`}>{t.ok ? <Check /> : "!"}</span>
                      <span className="text-[0.95rem] font-medium leading-snug">
                        {t.label}<span className="sr-only">{t.ok ? ", passed" : ", needs attention"}</span>
                        <span className="block text-sm font-normal text-ink/70">{t.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="mt-4">
                <Callout kind="warn" title="The seller has not run the hardware test">
                  Nothing on this listing has been checked by MobileTradeX. Ask {first} to run the test with you at the meetup, or pay through escrow so the money is held until you have.
                </Callout>
              </div>
            )}
          </section>

          <section aria-labelledby="seller" className="rounded-3xl border border-ink/10 bg-frost-50 p-6">
            <h2 id="seller" className="sr-only">About the seller</h2>
            <div className="flex items-start gap-4">
              <Avatar name={l.seller.name} size={52} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-semibold">
                  {l.seller.name}
                  <span className="inline-flex items-center gap-1 rounded-full bg-deep/15 px-2 py-0.5 text-xs font-medium text-deep"><Check size={10} /> CNIC verified</span>
                  {l.seller.refurbisher && <span className="rounded-full border border-ink/25 px-2 py-0.5 text-xs font-medium">Refurbisher</span>}
                </p>
                <p className="text-sm text-ink/70">{l.seller.city}, member since {l.seller.since}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                ["Deals closed", String(l.seller.deals)],
                ["Rating", l.seller.deals ? l.seller.rating.toFixed(1) : "None yet"],
                ["Replies in", l.seller.replies],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-ink/10 bg-frost px-2 py-3">
                  <dd className="text-lg font-semibold leading-tight">{v}</dd>
                  <dt className="mt-0.5 text-xs text-ink/65">{k}</dt>
                </div>
              ))}
            </dl>

            <h3 className="mt-6 text-[0.95rem] font-semibold">Reviews from closed deals</h3>
            <p className="text-sm text-ink/65">Only buyers who finished a deal with this seller can review, with photo or video proof.</p>
            {l.seller.reviews.length ? (
              <ul className="mt-4 space-y-4">
                {l.seller.reviews.map((r) => (
                  <li key={r.by} className="flex gap-3 rounded-2xl border border-ink/10 bg-frost p-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"><EvidencePhoto kind={r.evidence} tint={r.by.length} /></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <Stars value={r.stars} size={14} />
                        <span className="text-sm font-medium">{r.by}</span>
                        <span className="text-xs text-ink/60">{r.when}</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-ink/85">{r.text}</p>
                      <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-deep"><Check size={10} /> Deal closed, evidence attached</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4">
                <Callout kind="info" title={`${first} has no closed deals yet`}>This is a new seller, so there are no reviews. Pay through escrow to stay protected.</Callout>
              </div>
            )}
          </section>
        </div>

        {!gone && <div className="mt-6"><MeetupChecklist l={l} /></div>}

        {seen.length > 0 && (
          <div className="mt-10">
            <RecentStrip
              items={seen}
              onClear={() => {
                const prev = recent;
                clear();
                push(l.id);
                toast("Viewing history cleared.", { action: { label: "Undo", onClick: () => restore(prev) } });
              }}
            />
          </div>
        )}

        {similar.length > 0 && (
          <section aria-labelledby="sim" className="mt-12">
            <div className="flex items-end justify-between gap-3">
              <h2 id="sim" className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">Similar phones</h2>
              <Link href="/browse" className="text-sm font-medium text-deep underline-offset-4 hover:underline">Browse all</Link>
            </div>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((s) => <SimilarCard key={s.id} s={s} />)}
            </ul>
          </section>
        )}

        <p className="mt-10 text-sm text-ink/65">
          Something look wrong?{" "}
          <button type="button" onClick={() => setDlg("report")} className="font-medium text-deep underline underline-offset-4">Report this listing</button>
        </p>
      </main>

      {/* mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-frost-50/90 px-4 py-3 backdrop-blur-[24px] lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <p className="min-w-0 flex-1 text-lg font-semibold leading-tight">{rs(l.price)}<span className="block truncate text-xs font-normal text-ink/65">{l.title}</span></p>
          {canEscrow ? <button type="button" onClick={() => setDlg("escrow")} className="btn btn-primary !px-5 !py-2.5 text-sm">Buy with escrow</button> : null}
          <button type="button" onClick={() => setDlg("contact")} className={`btn !px-5 !py-2.5 text-sm ${canEscrow ? "btn-quiet" : "btn-primary"}`}>Chat</button>
        </div>
      </div>

      <Footer />

      <ContactDialog l={l} open={dlg === "contact"} onClose={() => setDlg(null)} />
      <OfferDialog key={`o${dlg === "offer"}`} l={l} open={dlg === "offer"} onClose={() => setDlg(null)} />
      <EscrowDialog l={l} open={dlg === "escrow"} onClose={() => setDlg(null)} />
      <ReportDialog l={l} open={dlg === "report"} onClose={() => setDlg(null)} />

      <Dialog open={zoom} onClose={() => setZoom(false)} wide title={shotLabels[shot]} description={`${pick + 1} of ${l.shots.length}`}>
        <div className="overflow-hidden rounded-2xl border border-ink/10">
          <div className="aspect-[4/3] w-full"><PhonePhoto color={l.color} shot={shot} cracked={l.screen === "cracked"} scuffed={l.body !== "mint"} seed={Number(l.id)} /></div>
        </div>
        <div className="mt-4 flex justify-between gap-3">
          <button type="button" className="btn btn-quiet" onClick={() => step(-1)}>Previous</button>
          <button type="button" className="btn btn-quiet" onClick={() => step(1)} data-autofocus>Next</button>
        </div>
      </Dialog>
    </div>
  );
}

function SimilarCard({ s }: { s: Listing }) {
  return (
    <li className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-frost-50 transition-colors hover:border-deep/50">
      <div className="aspect-[4/3] overflow-hidden">
        <PhonePhoto color={s.color} shot="front" cracked={s.screen === "cracked"} scuffed={s.body !== "mint"} seed={Number(s.id)} />
      </div>
      <div className="p-4">
        <p className="font-semibold leading-snug">
          <Link href={`/browse/${s.id}`} className="after:absolute after:inset-0 after:content-['']">{s.title}</Link>
        </p>
        <p className="text-sm text-ink/70">{s.storage}, {s.ram} RAM</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <GradeChip grade={s.grade} />
          <p className="font-semibold">{rs(s.price)}</p>
        </div>
      </div>
    </li>
  );
}
