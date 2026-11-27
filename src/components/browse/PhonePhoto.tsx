import { useId } from "react";

const BODY: Record<string, string> = {
  Black: "#1b2733",
  White: "#e6eaed",
  Silver: "#a9b4bd",
  Blue: "#2f5f8f",
  Green: "#456e5f",
  Gold: "#c8b27d",
  Purple: "#6f5b8d",
  Red: "#a24339",
  Other: "#7b8087",
};

const TINTS: [string, string][] = [
  ["#B7C9D8", "#E1EAF1"],
  ["#CFCDA3", "#EEEDD9"],
  ["#8FB0CB", "#C8DAE8"],
  ["#C5D3DC", "#E9EFF3"],
];

/** Light bodies need a darker outline to stand out from the backdrop. */
const isLight = (c: string) => c === "White" || c === "Silver" || c === "Gold";

/**
 * Placeholder "photo" of a listing, drawn in SVG (same family as the review
 * evidence photos). The photo reflects what the listing says: cracked screens
 * show a crack, dented bodies show scuffs. Swap for real <img>s later.
 */
export default function PhonePhoto({
  color,
  shot,
  cracked,
  scuffed,
  seed = 0,
}: {
  color: string;
  shot: string;
  cracked?: boolean;
  scuffed?: boolean;
  seed?: number;
}) {
  const uid = useId();
  const [from, to] = TINTS[seed % TINTS.length];
  const body = BODY[color] ?? BODY.Other;
  const edge = isLight(color) ? "#12202D" : "#05080c";
  const back = shot === "back";
  const lit = shot === "screenOn";

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={to} />
          <stop offset="1" stopColor={from} />
        </linearGradient>
        <linearGradient id={`${uid}scr`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#3b77b0" />
          <stop offset="1" stopColor="#12273d" />
        </linearGradient>
        <linearGradient id={`${uid}glare`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}bg)`} />
      <rect y="236" width="400" height="64" fill="#12202D" opacity="0.1" />

      {shot === "sides" ? (
        <g>
          <ellipse cx="200" cy="262" rx="120" ry="9" fill="#12202D" opacity="0.2" />
          {/* two phones edge-on, as in the "sides and corners" shot */}
          {[
            [128, -5],
            [232, 4],
          ].map(([x, r], i) => (
            <g key={i} transform={`rotate(${r} ${x + 20} 150)`}>
              <rect x={x} y="40" width="40" height="214" rx="12" fill={body} stroke={edge} strokeOpacity="0.5" strokeWidth="1.5" />
              <rect x={x + 36} y="92" width="4" height="34" rx="2" fill={edge} opacity="0.5" />
              <rect x={x + 36} y="136" width="4" height="22" rx="2" fill={edge} opacity="0.5" />
              <rect x={x} y="48" width="5" height="198" rx="2.5" fill="#fff" opacity="0.18" />
              {scuffed && i === 0 && <path d={`M${x + 4} 220l10 5M${x + 6} 228l8 3`} stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.55" />}
            </g>
          ))}
        </g>
      ) : shot === "extras" ? (
        <g>
          <ellipse cx="200" cy="262" rx="130" ry="9" fill="#12202D" opacity="0.2" />
          <g transform="rotate(-4 150 150)">
            <rect x="84" y="62" width="132" height="190" rx="7" fill="#F3F6F4" stroke="#12202D" strokeOpacity="0.2" />
            <rect x="102" y="86" width="96" height="12" rx="3" fill="#2E5E8E" opacity="0.85" />
            <rect x="102" y="108" width="62" height="7" rx="3" fill="#12202D" opacity="0.25" />
            <rect x="102" y="214" width="96" height="6" rx="3" fill="#12202D" opacity="0.18" />
          </g>
          <rect x="240" y="168" width="58" height="46" rx="9" fill="#F3F6F4" stroke="#12202D" strokeOpacity="0.25" />
          <rect x="266" y="154" width="8" height="16" fill="#9aa8b3" />
          <path d="M269 214 C 270 250, 330 232, 338 262" fill="none" stroke="#F3F6F4" strokeWidth="5" strokeLinecap="round" />
        </g>
      ) : (
        <g transform="rotate(-4 200 150)">
          <ellipse cx="204" cy="262" rx="80" ry="9" fill="#12202D" opacity="0.22" />
          <rect x="140" y="30" width="120" height="228" rx="24" fill={body} stroke={edge} strokeOpacity="0.55" strokeWidth="2" />
          {back ? (
            <>
              <rect x="150" y="40" width="50" height="50" rx="14" fill="#161f29" opacity="0.92" />
              {[
                [165, 55],
                [165, 76],
                [185, 65],
              ].map(([cx, cy]) => (
                <g key={`${cx}${cy}`}>
                  <circle cx={cx} cy={cy} r="8" fill="#7c8f9f" />
                  <circle cx={cx} cy={cy} r="5.6" fill="#05080c" />
                </g>
              ))}
              <circle cx="212" cy="50" r="3.5" fill="#fff" opacity="0.75" />
              <path d="M170 170c14-12 36-12 52 0" stroke="#fff" strokeOpacity="0.14" strokeWidth="3" fill="none" strokeLinecap="round" />
              <rect x="140" y="30" width="120" height="228" rx="24" fill={`url(#${uid}glare)`} />
              {scuffed && <path d="M236 214l12 6M232 226l16 5M158 244l9-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />}
            </>
          ) : (
            <>
              <rect x="148" y="38" width="104" height="212" rx="18" fill={lit ? `url(#${uid}scr)` : "#070b10"} />
              <rect x="190" y="46" width="20" height="6" rx="3" fill="#000" opacity="0.8" />
              {lit ? (
                <g fill="#fff">
                  <rect x="168" y="86" width="64" height="12" rx="4" opacity="0.9" />
                  <rect x="178" y="104" width="44" height="6" rx="3" opacity="0.5" />
                  {[0, 1, 2, 3].map((i) => (
                    <rect key={i} x={162 + (i % 2) * 38} y={152 + Math.floor(i / 2) * 36} width="30" height="26" rx="8" opacity="0.22" />
                  ))}
                </g>
              ) : (
                <path d="M152 48 L236 48 L152 150 Z" fill="#fff" opacity="0.05" />
              )}
              {cracked && (
                <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M232 60 L205 110 L214 138 L186 176 L160 232" strokeWidth="1.8" opacity="0.9" />
                  <path d="M205 110 L170 100 L156 80M214 138 L240 150M186 176 L216 192" strokeWidth="1.2" opacity="0.75" />
                  <path d="M205 110 L226 122M186 176 L168 164" strokeWidth="1" opacity="0.6" />
                </g>
              )}
              {scuffed && <path d="M140 60l-1 6M141 238l0 8M258 90l1 7" stroke="#fff" strokeWidth="2" opacity="0.5" strokeLinecap="round" />}
              <rect x="148" y="38" width="104" height="212" rx="18" fill={`url(#${uid}glare)`} />
            </>
          )}
        </g>
      )}
    </svg>
  );
}
