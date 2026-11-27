import Link from "next/link";
import { members } from "@/data/content";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-deep-900 px-5 py-14 text-snow md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="text-xl font-semibold tracking-tight">MobileTradeX</p>
          <p className="mt-3 max-w-xs text-[0.95rem] text-mist">
            Verified second-hand phones, bought and sold between people.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="text-sm font-semibold">Explore</p>
          <ul className="mt-3 space-y-2 text-[0.95rem] text-mist">
            <li><Link className="hover:text-snow" href="/browse">Browse phones</Link></li>
            <li><a className="hover:text-snow" href="#how">How it works</a></li>
            <li><a className="hover:text-snow" href="#services">Services</a></li>
            <li><a className="hover:text-snow" href="#brands">Brands</a></li>
            <li><a className="hover:text-snow" href="#reviews">Reviews</a></li>
            <li><Link className="hover:text-snow" href="/chat">Messages</Link></li>
            <li><Link className="hover:text-snow" href="/sell">Sell a phone</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-sm font-semibold">HCI course project, Phase 4 prototype</p>
          <ul className="mt-3 space-y-2 text-[0.95rem] text-mist">
            {members.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
