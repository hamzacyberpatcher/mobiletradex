import { useId } from "react";
import type { EvidenceKind } from "@/data/content";

const TINTS: [string, string][] = [
  ["#B7C9D8", "#E1EAF1"],
  ["#CFCDA3", "#EEEDD9"],
  ["#8FB0CB", "#C8DAE8"],
];

/**
 * Placeholder "photo" for a review's attached evidence: a phone on a table,
 * drawn in SVG. Swap for real <img>s when real photos exist.
 */
export default function EvidencePhoto({ kind, tint = 0 }: { kind: EvidenceKind; tint?: number }) {
  const uid = useId();
  const [from, to] = TINTS[tint % TINTS.length];
  const back = kind === "back";

  return (
    <svg viewBox="0 0 360 400" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={to} />
          <stop offset="1" stopColor={from} />
        </linearGradient>
        <linearGradient id={`${uid}scr`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#2f6194" />
          <stop offset="1" stopColor="#12273d" />
        </linearGradient>
      </defs>

      <rect width="360" height="400" fill={`url(#${uid}bg)`} />
      {/* table edge and contact shadow */}
      <rect y="292" width="360" height="108" fill="#12202D" opacity="0.12" />
      <ellipse cx="186" cy="318" rx="86" ry="11" fill="#12202D" opacity="0.2" />

      {kind === "box" && (
        <g transform="rotate(7 262 230)">
          <rect x="206" y="150" width="112" height="150" rx="6" fill="#F3F6F4" stroke="#12202D" strokeOpacity="0.2" />
          <rect x="222" y="170" width="80" height="10" rx="3" fill="#2E5E8E" opacity="0.8" />
          <rect x="222" y="190" width="56" height="6" rx="3" fill="#12202D" opacity="0.25" />
          <path d="M120 280 C 90 300, 140 310, 170 300 S 215 296, 226 312" fill="none" stroke="#F3F6F4" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      <g transform="rotate(-6 180 200)">
        {/* body */}
        <rect x="130" y="60" width="110" height="240" rx="21" fill={back ? "#AEBFCC" : "#1b3350"} />

        {back ? (
          <>
            <rect x="140" y="70" width="48" height="48" rx="13" fill="#1c2a38" />
            {[
              [155, 85],
              [155, 104],
              [173, 94],
            ].map(([cx, cy]) => (
              <g key={`${cx}${cy}`}>
                <circle cx={cx} cy={cy} r="7.5" fill="#8aa2b6" />
                <circle cx={cx} cy={cy} r="5.2" fill="#05080c" />
              </g>
            ))}
            <path d="M170 220 l30 -22 M160 245 l44 -30" stroke="#F3F6F4" strokeOpacity="0.5" strokeWidth="1.2" />
          </>
        ) : (
          <>
            <rect x="137" y="67" width="96" height="226" rx="15" fill={`url(#${uid}scr)`} />
            <rect x="167" y="73" width="36" height="9" rx="4.5" fill="#06090d" />
            <circle cx="185" cy="140" r="26" fill="none" stroke="#C5C49B" strokeWidth="6" strokeDasharray="130 40" strokeLinecap="round" />
            <rect x="148" y="190" width="74" height="12" rx="5" fill="#E6EBE8" opacity="0.14" />
            <rect x="148" y="208" width="74" height="12" rx="5" fill="#E6EBE8" opacity="0.14" />
            <rect x="148" y="250" width="74" height="22" rx="11" fill="#C5C49B" />
          </>
        )}

        {kind === "crack" && (
          <g stroke="#F3F6F4" strokeWidth="1.6" strokeLinecap="round" fill="none">
            <path d="M228 288 L206 262 L212 238 L190 214 L196 184" />
            <path d="M228 288 L196 276 L170 282 L146 264" />
            <path d="M206 262 L230 248" />
            <path d="M228 288 L222 250 L232 222" />
          </g>
        )}

        {kind === "video" && (
          <>
            <circle cx="185" cy="180" r="30" fill="#F3F6F4" opacity="0.92" />
            <path d="M177 165 L202 180 L177 195 Z" fill="#2E5E8E" />
            <rect x="148" y="262" width="74" height="4" rx="2" fill="#F3F6F4" opacity="0.35" />
            <rect x="148" y="262" width="34" height="4" rx="2" fill="#C5C49B" />
          </>
        )}
      </g>
    </svg>
  );
}
