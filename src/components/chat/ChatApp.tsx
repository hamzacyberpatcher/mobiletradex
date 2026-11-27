"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Dialog from "@/components/Dialog";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useToast } from "@/components/ToastProvider";
import { Callout, Check, Field, inputCls, ProgressBar } from "@/components/listing/ui";
import { conversations as seed, type Conversation, type Message, type OfferStatus } from "@/data/chat";
import { rs } from "@/lib/listing";
import { PHONE_RE, PHONE_TEST, REPLIES, SCAM_RE, TEMPLATES, time } from "@/lib/chat";

/**
 * Prototype chat. Everything is local state; "seller" replies are canned.
 * What it demonstrates (interviews + proposal): masked phone numbers, structured
 * offers, escrow as the default, and an automatic fraud alert instead of silence.
 */

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-full bg-deep text-sm font-semibold text-frost-50"
    >
      {initials}
    </span>
  );
}

function Verified({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-deep/15 px-2 py-0.5 text-xs font-medium text-deep">
      <Check size={10} /> {label}
    </span>
  );
}

const lastOf = (c: Conversation) => c.messages.filter((m) => m.from !== "system").at(-1) ?? c.messages.at(-1)!;
const preview = (m: Message) => (m.kind === "offer" ? `${m.from === "me" ? "You offered" : "Offer"} ${rs(m.amount)}` : m.text);

export default function ChatApp() {
  const { toast } = useToast();
  const [convs, setConvs] = useState<Conversation[]>(seed);
  const [activeId, setActiveId] = useState(seed[0].id);
  const [thread, setThread] = useState(false); // mobile: showing the thread instead of the list
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [text, setText] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [accept, setAccept] = useState<string | null>(null); // offer message id being confirmed
  const [reportOpen, setReportOpen] = useState(false);
  const timers = useRef<number[]>([]);
  const end = useRef<HTMLDivElement>(null);

  const active = convs.find((c) => c.id === activeId)!;
  const shown = filter === "unread" ? convs.filter((c) => c.unread > 0) : convs;
  const closed = active.phone.status === "sold";
  const unreadTotal = convs.reduce((n, c) => n + c.unread, 0);
  const warn = useMemo(() => (PHONE_TEST.test(text) || SCAM_RE.test(text)), [text]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [active.messages.length, typing, activeId]);

  const patch = (id: string, fn: (c: Conversation) => Conversation) => setConvs((all) => all.map((c) => (c.id === id ? fn(c) : c)));
  const push = (id: string, m: Message) => patch(id, (c) => ({ ...c, messages: [...c.messages, m] }));
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const open = (id: string) => {
    setActiveId(id);
    setThread(true);
    patch(id, (c) => ({ ...c, unread: 0 }));
    setText("");
  };

  const reply = (id: string, said: string) => {
    const hit = REPLIES.find(([re]) => re.test(said));
    const name = convs.find((c) => c.id === id)!.seller.name.split(" ")[0];
    setTyping(id);
    later(1500, () => {
      setTyping(null);
      push(id, { id: `r${Date.now()}`, from: "them", kind: "text", text: hit ? hit[1] : `Thanks for your message. ${name} will get back to you shortly.`, time: time() });
    });
  };

  const send = (raw: string) => {
    const body = raw.trim();
    if (!body || closed) return;
    const masked = PHONE_TEST.test(body);
    const safe = body.replace(PHONE_RE, "••••••••••");
    push(activeId, { id: `s${Date.now()}`, from: "me", kind: "text", text: safe, time: time() });
    if (masked) {
      push(activeId, {
        id: `a${Date.now()}`,
        from: "system",
        kind: "alert",
        text: "We hid a phone number in your message. Keep the conversation in MobileTradeX so escrow and the safe meetup zones can protect you.",
        time: time(),
      });
    } else reply(activeId, body);
    setText("");
  };

  const answerOffer = (msgId: string, status: OfferStatus) => {
    patch(activeId, (c) => ({
      ...c,
      messages: c.messages.map((m) => (m.id === msgId && m.kind === "offer" ? { ...m, status } : m)),
    }));
  };

  const accepting = active.messages.find((m) => m.id === accept && m.kind === "offer");

  return (
    <div className="min-h-svh bg-frost">
      <Header variant="chat" />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6 md:pt-32">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="h-section !text-4xl md:!text-5xl">Messages</h1>
            <p className="mt-2 max-w-xl text-ink/75">
              Talk to sellers, send offers and start escrow here. Your phone number is never shown to the other person.
            </p>
          </div>
          <p aria-live="polite" className="text-sm text-ink/65">
            {unreadTotal ? `${unreadTotal} unread ${unreadTotal === 1 ? "message" : "messages"}` : "You are all caught up"}
          </p>
        </div>

        <div className="grid h-[min(46rem,calc(100svh-13rem))] min-h-[34rem] overflow-hidden rounded-3xl border border-ink/10 bg-frost-50 shadow-[0_20px_50px_-30px_rgba(14,24,33,0.5)] md:grid-cols-[20rem_1fr]">
          {/* conversation list */}
          <section aria-label="Conversations" className={`min-h-0 flex-col border-ink/10 md:flex md:border-r ${thread ? "hidden" : "flex"}`}>
            <div className="flex gap-2 border-b border-ink/10 p-3">
              {(["all", "unread"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    filter === f ? "border-deep bg-deep text-frost-50" : "border-ink/20 hover:border-ink/40"
                  }`}
                >
                  {f === "all" ? "All" : "Unread"}
                </button>
              ))}
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto" data-lenis-prevent>
              {shown.length === 0 && (
                <li className="p-6 text-sm text-ink/70">
                  No unread messages. <button type="button" onClick={() => setFilter("all")} className="font-medium text-deep underline underline-offset-2">Show all conversations</button>
                </li>
              )}
              {shown.map((c) => {
                const last = lastOf(c);
                const on = c.id === activeId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => open(c.id)}
                      aria-current={on ? "true" : undefined}
                      className={`flex w-full gap-3 border-b border-ink/10 p-4 text-left transition-colors hover:bg-ink/5 ${on ? "bg-deep/10" : ""}`}
                    >
                      <Avatar name={c.seller.name} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate font-semibold">{c.seller.name}</span>
                          <span className="shrink-0 text-xs text-ink/60">{last.time}</span>
                        </span>
                        <span className="block truncate text-sm text-ink/70">{c.phone.title}, {rs(c.phone.price)}</span>
                        <span className="mt-0.5 flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${c.unread ? "font-medium" : "text-ink/60"}`}>{preview(last)}</span>
                          {c.unread > 0 && (
                            <span aria-label={`${c.unread} unread`} className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-deep px-1.5 text-xs font-semibold text-frost-50">
                              {c.unread}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* thread */}
          <section aria-label={`Conversation with ${active.seller.name}`} className={`min-h-0 min-w-0 flex-col md:flex ${thread ? "flex" : "hidden"}`}>
            <header className="flex items-center gap-3 border-b border-ink/10 p-3 md:p-4">
              <button type="button" onClick={() => setThread(false)} aria-label="Back to conversations" className="grid h-9 w-9 place-items-center rounded-full border border-ink/20 hover:bg-ink/5 md:hidden">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <Avatar name={active.seller.name} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                  {active.seller.name}
                  {active.seller.cnic && <Verified label="CNIC verified" />}
                </p>
                <p className="truncate text-sm text-ink/65">
                  {active.seller.city}, {active.seller.deals} deals closed, rated {active.seller.rating.toFixed(1)}
                </p>
              </div>
              <button type="button" onClick={() => setReportOpen(true)} className="btn btn-quiet !px-4 !py-2 text-sm">
                Report
              </button>
            </header>

            {/* the phone under discussion, in the same order as every listing: name, specs, condition, price */}
            <div className="flex items-center gap-3 border-b border-ink/10 bg-frost p-3 md:px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/brands/${active.phone.brand}.svg`} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{active.phone.title}</p>
                <p className="truncate text-sm text-ink/70">{active.phone.spec}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full border border-ink/20 px-2 py-0.5 text-xs font-medium">{active.phone.grade}</span>
                  {active.phone.verified && <Verified label="Verified Hardware" />}
                  {closed && <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-medium">Sold</span>}
                </p>
              </div>
              <p className="shrink-0 text-right font-semibold">{rs(active.phone.price)}</p>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" data-lenis-prevent role="log" aria-live="polite" aria-label="Messages">
              {active.messages.map((m) => {
                if (m.from === "system")
                  return m.kind === "alert" ? (
                    <div key={m.id} className="mx-auto max-w-md"><Callout kind="warn" title="Phone number hidden">{m.text}</Callout></div>
                  ) : (
                    <p key={m.id} className="mx-auto max-w-md rounded-2xl bg-ink/5 px-4 py-2 text-center text-sm text-ink/70">{m.text}</p>
                  );
                const mine = m.from === "me";
                if (m.kind === "offer")
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className="w-full max-w-xs rounded-2xl border border-ink/15 bg-frost p-4">
                        <p className="text-sm text-ink/70">{mine ? "Your offer" : `${active.seller.name.split(" ")[0]}'s counter offer`}</p>
                        <p className="mt-0.5 text-2xl font-semibold tracking-[-0.02em]">{rs(m.amount)}</p>
                        <p className="mt-1 text-sm text-ink/70">{m.payment === "escrow" ? "Paid through escrow" : "Cash at meetup"}</p>
                        {m.status === "pending" && !mine && !closed ? (
                          <div className="mt-3 flex gap-2">
                            <button type="button" className="btn btn-primary !px-4 !py-2 text-sm" onClick={() => setAccept(m.id)}>Accept</button>
                            <button
                              type="button"
                              className="btn btn-quiet !px-4 !py-2 text-sm"
                              onClick={() => {
                                answerOffer(m.id, "declined");
                                toast("Offer declined.", { action: { label: "Undo", onClick: () => answerOffer(m.id, "pending") }, duration: 5000 });
                              }}
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${m.status === "accepted" ? "bg-deep/15 text-deep" : m.status === "declined" ? "bg-crack/15 text-crack" : "bg-ink/10"}`}>
                            {m.status === "accepted" && <Check size={10} />}
                            {m.status === "accepted" ? "Accepted" : m.status === "declined" ? "Declined" : "Waiting for a reply"}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-ink/55">{m.time}</p>
                      </div>
                    </div>
                  );
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[70%] ${mine ? "rounded-br-md bg-deep text-frost-50" : "rounded-bl-md bg-ink/[0.07]"}`}>
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p className={`mt-1 text-xs ${mine ? "text-frost-50/75" : "text-ink/55"}`}>{m.time}</p>
                    </div>
                  </div>
                );
              })}
              {typing === active.id && (
                <div className="flex" aria-label={`${active.seller.name} is typing`}>
                  <div className="flex gap-1 rounded-2xl rounded-bl-md bg-ink/[0.07] px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span key={i} style={{ animationDelay: `${i * 150}ms` }} className="h-2 w-2 animate-bounce rounded-full bg-ink/40 motion-reduce:animate-none" />
                    ))}
                  </div>
                </div>
              )}
              <div ref={end} />
            </div>

            {/* composer */}
            <div className="border-t border-ink/10 p-3 md:p-4">
              {closed ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink/75">This phone has been sold, so the conversation is closed.</p>
                  <Link href="/" className="btn btn-primary !px-5 !py-2 text-sm">Find a similar phone</Link>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex gap-2 overflow-x-auto pb-1" aria-label="Quick messages">
                    {TEMPLATES.map((t) => (
                      <button key={t} type="button" onClick={() => send(t)} className="shrink-0 rounded-full border border-ink/20 px-3 py-1.5 text-sm transition-colors hover:border-ink/40 hover:bg-ink/5">
                        {t}
                      </button>
                    ))}
                  </div>
                  {warn && (
                    <p role="status" className="mb-2 flex items-start gap-2 rounded-xl border border-reed/70 bg-reed/20 px-3 py-2 text-sm">
                      Phone numbers are hidden and payments outside MobileTradeX are not protected. Keep the deal in the app.
                    </p>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      send(text);
                    }}
                    className="flex items-end gap-2"
                  >
                    <label htmlFor="chat-input" className="sr-only">Message to {active.seller.name}</label>
                    <input
                      id="chat-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Write a message"
                      autoComplete="off"
                      className={`${inputCls()} min-w-0 flex-1 !rounded-full`}
                    />
                    <button type="button" className="btn btn-quiet !px-5" onClick={() => setOfferOpen(true)}>Make offer</button>
                    <button type="submit" disabled={!text.trim()} className="btn btn-primary !px-5 disabled:cursor-not-allowed disabled:opacity-40">Send</button>
                  </form>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />

      <OfferDialog
        key={activeId + String(offerOpen)}
        open={offerOpen}
        conv={active}
        onClose={() => setOfferOpen(false)}
        onSent={(amount, payment) => {
          push(activeId, { id: `o${Date.now()}`, from: "me", kind: "offer", amount, payment, status: "pending", time: time() });
          setOfferOpen(false);
          toast(`Offer of ${rs(amount)} sent to ${active.seller.name.split(" ")[0]}.`, { kind: "success" });
          later(1800, () => reply(activeId, "price negotiable"));
        }}
      />

      <Dialog
        open={!!accepting}
        onClose={() => setAccept(null)}
        title="Accept this offer?"
        description={accepting && accepting.kind === "offer" ? `${rs(accepting.amount)} for the ${active.phone.title}, ${accepting.payment === "escrow" ? "paid through escrow" : "paid in cash at the meetup"}.` : undefined}
      >
        <p className="text-[0.95rem] text-ink/80">
          The phone is reserved for this buyer and other offers are paused. With escrow, the money stays with MobileTradeX until the phone is checked at the meetup.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-quiet" onClick={() => setAccept(null)}>Not yet</button>
          <button
            type="button"
            data-autofocus
            className="btn btn-primary"
            onClick={() => {
              if (!accepting) return;
              answerOffer(accepting.id, "accepted");
              push(activeId, { id: `e${Date.now()}`, from: "system", kind: "event", text: `Offer accepted. Next, agree a time at the safe meetup zone in ${active.seller.city}.`, time: time() });
              setAccept(null);
              toast("Offer accepted. The phone is reserved for you.", { kind: "success" });
            }}
          >
            Accept offer
          </button>
        </div>
      </Dialog>

      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} title={`Report ${active.seller.name}?`} description="Tell us what went wrong. A MobileTradeX reviewer checks every report within 24 hours.">
        <ul className="space-y-2">
          {["Asked me to pay outside the app", "Shared a fake or misleading listing", "Rude or threatening messages"].map((r) => (
            <li key={r}>
              <button
                type="button"
                className="w-full rounded-xl border border-ink/20 px-4 py-3 text-left transition-colors hover:border-ink/40 hover:bg-ink/5"
                onClick={() => {
                  setReportOpen(false);
                  toast("Report sent. The seller is not told it came from you.", { kind: "success" });
                }}
              >
                {r}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-quiet mt-5 w-full" onClick={() => setReportOpen(false)}>Cancel</button>
      </Dialog>
    </div>
  );
}

function OfferDialog({
  open,
  conv,
  onClose,
  onSent,
}: {
  open: boolean;
  conv: Conversation;
  onClose: () => void;
  onSent: (amount: number, payment: "escrow" | "cod") => void;
}) {
  const [val, setVal] = useState("");
  const [payment, setPayment] = useState<"escrow" | "cod">("escrow");
  const [sending, setSending] = useState(0); // 0 idle, 1..100 progress
  const n = Number(val.replace(/\D/g, ""));
  const price = conv.phone.price;
  const error = !n ? undefined : n > price ? "This is higher than the asking price. Offer the asking price or less." : n < price * 0.6 ? `Offers under ${rs(price * 0.6)} are rarely accepted for this phone.` : undefined;
  const ok = n > 0 && !error;

  useEffect(() => {
    if (!sending) return;
    if (sending >= 100) {
      const t = setTimeout(() => onSent(n, payment), 250);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSending((s) => Math.min(100, s + 34)), 350);
    return () => clearTimeout(t);
  }, [sending]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onClose={sending ? () => {} : onClose} closeOnBackdrop={!sending} title={`Make an offer for the ${conv.phone.title}`} description={`Asking price ${rs(price)}. ${conv.seller.name.split(" ")[0]} sees your offer, never your number.`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (ok && !sending) setSending(1);
        }}
        className="space-y-5"
      >
        <Field label="Your offer (Rs)" error={error} hint={!error && n ? `That is ${Math.round((n / price) * 100)}% of the asking price.` : "Enter the amount you are ready to pay."}>
          {(p) => (
            <input
              {...p}
              data-autofocus
              inputMode="numeric"
              value={val ? Number(val.replace(/\D/g, "")).toLocaleString("en-US") : ""}
              onChange={(e) => setVal(e.target.value)}
              placeholder={price.toLocaleString("en-US")}
              disabled={!!sending}
              className={inputCls(!!error)}
            />
          )}
        </Field>
        <fieldset disabled={!!sending}>
          <legend className="mb-1.5 text-sm font-medium">How will you pay?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {([["escrow", "Escrow", "Money is held until you confirm the phone"], ["cod", "Cash at meetup", "Pay the seller after inspecting"]] as const).map(([v, label, hint]) => (
              <label key={v} className={`cursor-pointer rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-deep/40 ${payment === v ? "border-deep bg-deep/10" : "border-ink/20 hover:border-ink/40"}`}>
                <input type="radio" name="pay" className="sr-only" checked={payment === v} onChange={() => setPayment(v)} />
                <span className="block font-medium">{label}</span>
                <span className="block text-sm text-ink/70">{hint}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {sending > 0 && <ProgressBar value={sending} label="Sending offer" slow />}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-quiet" onClick={onClose} disabled={!!sending}>Cancel</button>
          <button type="submit" disabled={!ok || !!sending} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40">
            {sending ? "Sending offer" : "Send offer"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
