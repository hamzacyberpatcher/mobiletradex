"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { Check, inputCls } from "@/components/listing/ui";
import { Avatar, Icon, ICONS } from "@/components/browse/ui";
import { conversations as seed, type Conversation, type Message } from "@/data/chat";
import { cannedReply, PHONE_RE, PHONE_TEST, SCAM_RE, TEMPLATES, time } from "@/lib/chat";
import { rs } from "@/lib/listing";

const lastOf = (c: Conversation) => c.messages.filter((m) => m.from !== "system").at(-1) ?? c.messages.at(-1)!;
const preview = (m: Message) => (m.kind === "offer" ? `${m.from === "me" ? "You offered" : "Offer"} ${rs(m.amount)}` : m.text);

/**
 * Floating chat for the browse pages: a button at the bottom right opens a small
 * window where the buyer can chat without leaving the phone they are looking at
 * (Mandel: keep the user in context, Shneiderman 7). The expand icon opens the
 * full /chat page. Same masking rules and canned replies as the full page.
 */
export default function ChatWidget({ lift }: { lift?: boolean }) {
  const { toast } = useToast();
  const path = usePathname();
  const onListing = /^\/browse\/(\d+)/.exec(path)?.[1];
  const [open, setOpen] = useState(false);
  const [convs, setConvs] = useState<Conversation[]>(seed);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const end = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);

  const active = convs.find((c) => c.id === activeId) ?? null;
  const unread = convs.reduce((n, c) => n + c.unread, 0);
  const closed = active?.phone.status === "sold";
  const warn = useMemo(() => PHONE_TEST.test(text) || SCAM_RE.test(text), [text]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [active?.messages.length, typing, activeId, open]);

  const patch = (id: string, fn: (c: Conversation) => Conversation) => setConvs((all) => all.map((c) => (c.id === id ? fn(c) : c)));
  const push = (id: string, m: Message) => patch(id, (c) => ({ ...c, messages: [...c.messages, m] }));

  const openThread = (id: string) => {
    setActiveId(id);
    patch(id, (c) => ({ ...c, unread: 0 }));
    setText("");
  };

  const toggle = () => {
    if (open) return close();
    setOpen(true);
    // on a listing the seller of that phone is the most likely person to message
    const about = convs.find((c) => c.listingId === onListing);
    if (about && !activeId) openThread(about.id);
  };

  const close = () => {
    setOpen(false);
    launcher.current?.focus();
  };

  const send = (raw: string) => {
    const body = raw.trim();
    if (!body || !active || closed) return;
    const id = active.id;
    const masked = PHONE_TEST.test(body);
    push(id, { id: `s${Date.now()}`, from: "me", kind: "text", text: body.replace(PHONE_RE, "••••••••••"), time: time() });
    if (masked) {
      push(id, { id: `a${Date.now()}`, from: "system", kind: "alert", text: "We hid a phone number in your message. Keep the conversation here so escrow and safe meetup zones can protect you.", time: time() });
    } else {
      setTyping(id);
      timers.current.push(
        window.setTimeout(() => {
          setTyping(null);
          push(id, { id: `r${Date.now()}`, from: "them", kind: "text", text: cannedReply(body, active.seller.name.split(" ")[0]), time: time() });
        }, 1500),
      );
    }
    setText("");
  };

  return (
    <>
      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-label={active ? `Chat with ${active.seller.name}` : "Messages"}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
          className={`fixed right-4 z-50 flex h-[34rem] max-h-[calc(100svh-7.5rem)] w-[23rem] max-w-[calc(100vw-2rem)] animate-dialog-in flex-col overflow-hidden rounded-3xl border border-ink/10 bg-frost-50 text-ink shadow-[0_30px_80px_-20px_rgba(14,24,33,0.6)] motion-reduce:animate-none md:right-6 ${lift ? "bottom-40 md:bottom-24" : "bottom-24"}`}
        >
          <header className="flex items-center gap-2 border-b border-ink/10 p-3">
            {active ? (
              <>
                <button type="button" onClick={() => setActiveId(null)} aria-label="Back to conversations" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-ink/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
                </button>
                <Avatar name={active.seller.name} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">{active.seller.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-deep"><Check size={9} /> CNIC verified</p>
                </div>
              </>
            ) : (
              <h2 className="flex-1 pl-2 text-base font-semibold">Messages</h2>
            )}
            <Link href="/chat" aria-label="Open the full chat window" title="Open full chat window" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/75 hover:bg-ink/10 hover:text-ink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" /></svg>
            </Link>
            <button type="button" onClick={close} aria-label="Minimise chat" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/75 hover:bg-ink/10 hover:text-ink">
              <Icon d={ICONS.x} size={16} />
            </button>
          </header>

          {!active ? (
            <ul data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto">
              {convs.map((c) => {
                const last = lastOf(c);
                return (
                  <li key={c.id}>
                    <button type="button" onClick={() => openThread(c.id)} className="flex w-full gap-3 border-b border-ink/10 p-3.5 text-left transition-colors hover:bg-ink/5">
                      <Avatar name={c.seller.name} size={38} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{c.seller.name}</span>
                          <span className="shrink-0 text-xs text-ink/60">{last.time}</span>
                        </span>
                        <span className="block truncate text-xs text-ink/70">{c.phone.title}, {rs(c.phone.price)}</span>
                        <span className="mt-0.5 flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${c.unread ? "font-medium" : "text-ink/60"}`}>{preview(last)}</span>
                          {c.unread > 0 && <span aria-label={`${c.unread} unread`} className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-deep px-1.5 text-xs font-semibold text-frost-50">{c.unread}</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <>
              <Link href={`/browse/${active.listingId}`} className="flex items-center justify-between gap-3 border-b border-ink/10 bg-frost px-3.5 py-2 text-sm hover:bg-ink/5">
                <span className="min-w-0 truncate font-medium">{active.phone.title}</span>
                <span className="shrink-0 text-ink/75">{rs(active.phone.price)}</span>
              </Link>
              <div data-lenis-prevent role="log" aria-live="polite" aria-label="Messages" className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3.5">
                {active.messages.map((m) => {
                  if (m.from === "system")
                    return <p key={m.id} className={`mx-auto max-w-[17rem] rounded-2xl px-3 py-2 text-center text-xs ${m.kind === "alert" ? "border border-reed/70 bg-reed/20" : "bg-ink/5 text-ink/70"}`}>{m.text}</p>;
                  const mine = m.from === "me";
                  if (m.kind === "offer")
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className="w-52 rounded-2xl border border-ink/15 bg-frost p-3">
                          <p className="text-xs text-ink/70">{mine ? "Your offer" : "Counter offer"}</p>
                          <p className="text-xl font-semibold tracking-[-0.02em]">{rs(m.amount)}</p>
                          <p className="text-xs text-ink/70">{m.payment === "escrow" ? "Paid through escrow" : "Cash at meetup"}</p>
                          {m.status === "pending" && !mine && !closed ? (
                            <Link href="/chat" className="btn btn-primary mt-2 !px-3 !py-1.5 text-xs">Review offer in full chat</Link>
                          ) : (
                            <p className="mt-2 text-xs font-semibold">{m.status === "accepted" ? "Accepted" : m.status === "declined" ? "Declined" : "Waiting for a reply"}</p>
                          )}
                        </div>
                      </div>
                    );
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${mine ? "rounded-br-md bg-deep text-frost-50" : "rounded-bl-md bg-ink/[0.07]"}`}>
                        <p className="whitespace-pre-wrap break-words text-sm">{m.text}</p>
                        <p className={`mt-0.5 text-[11px] ${mine ? "text-frost-50/75" : "text-ink/55"}`}>{m.time}</p>
                      </div>
                    </div>
                  );
                })}
                {typing === active.id && (
                  <div className="flex" aria-label={`${active.seller.name} is typing`}>
                    <div className="flex gap-1 rounded-2xl rounded-bl-md bg-ink/[0.07] px-3.5 py-3">
                      {[0, 1, 2].map((i) => <span key={i} style={{ animationDelay: `${i * 150}ms` }} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 motion-reduce:animate-none" />)}
                    </div>
                  </div>
                )}
                <div ref={end} />
              </div>
              <div className="border-t border-ink/10 p-3">
                {closed ? (
                  <p className="text-sm text-ink/75">This phone has been sold, so the conversation is closed.</p>
                ) : (
                  <>
                    <div data-lenis-prevent className="mb-2 flex gap-2 overflow-x-auto pb-1" aria-label="Quick messages">
                      {TEMPLATES.map((t) => <button key={t} type="button" onClick={() => send(t)} className="shrink-0 rounded-full border border-ink/20 px-2.5 py-1 text-xs hover:border-ink/40 hover:bg-ink/5">{t}</button>)}
                    </div>
                    {warn && <p role="status" className="mb-2 rounded-xl border border-reed/70 bg-reed/20 px-3 py-1.5 text-xs">Phone numbers are hidden and payments outside MobileTradeX are not protected.</p>}
                    <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-center gap-2">
                      <label htmlFor="widget-input" className="sr-only">Message to {active.seller.name}</label>
                      <input id="widget-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" autoComplete="off" className={`${inputCls()} min-w-0 flex-1 !rounded-full !py-2 text-sm`} />
                      <button type="submit" disabled={!text.trim()} className="btn btn-primary !px-4 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">Send</button>
                    </form>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <button
        ref={launcher}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Close chat" : unread ? `Open chat, ${unread} unread` : "Open chat"}
        className={`fixed right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand text-snow shadow-[0_12px_30px_-8px_rgba(14,24,33,0.6)] transition-transform hover:scale-105 active:scale-95 motion-reduce:transition-none md:right-6 ${lift ? "bottom-20 md:bottom-6" : "bottom-6"}`}
      >
        {open ? <Icon d={ICONS.chevron} size={22} /> : <Icon d={ICONS.chat} size={22} />}
        {!open && unread > 0 && (
          <span aria-hidden className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-frost bg-crack px-1 text-[11px] font-semibold text-snow">{unread}</span>
        )}
      </button>
    </>
  );
}
