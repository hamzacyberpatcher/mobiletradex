import * as THREE from "three";

/** Handset dimensions in world units (phone-local space). */
export const PHONE = { W: 1, H: 2.05, D: 0.11, R: 0.17, INSET: 0.03 };
export const SCREEN_W = PHONE.W - PHONE.INSET * 2;
export const SCREEN_H = PHONE.H - PHONE.INSET * 2;

/** Where the drop impact happened, in screen UV (bottom-right corner). */
export const IMPACT_UV = new THREE.Vector2(0.93, 0.05);

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const CW = 564;
const CH = Math.round((CW * SCREEN_H) / SCREEN_W); // keep screen aspect

/** The lit screen: a condition report, the thing MobileTradeX produces. */
export function drawScreen(
  fontSans: string,
  fontMono: string,
  tex?: THREE.CanvasTexture,
) {
  const c = tex ? (tex.image as HTMLCanvasElement) : makeCanvas(CW, CH);
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, CW, CH);

  const bg = g.createLinearGradient(0, 0, CW * 0.4, CH);
  bg.addColorStop(0, "#2f6194");
  bg.addColorStop(0.55, "#1f4468");
  bg.addColorStop(1, "#12273d");
  g.fillStyle = bg;
  g.fillRect(0, 0, CW, CH);

  // status bar + camera pill
  g.fillStyle = "#e6ebe8";
  g.font = `600 22px ${fontSans}`;
  g.textAlign = "left";
  g.fillText("9:41", 38, 52);
  g.fillStyle = "#06090d";
  g.beginPath();
  g.roundRect(CW / 2 - 52, 28, 104, 32, 16);
  g.fill();

  // heading
  g.fillStyle = "#b7c9d8";
  g.font = `500 22px ${fontSans}`;
  g.fillText("Condition report", 38, 128);
  g.fillStyle = "#f3f6f4";
  g.font = `600 40px ${fontSans}`;
  g.fillText("Galaxy S21, 128 GB", 38, 176);

  // score ring
  const cx = CW / 2;
  const cy = 360;
  const r = 112;
  g.lineWidth = 18;
  g.lineCap = "round";
  g.strokeStyle = "rgba(183,201,216,0.2)";
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = "#c5c49b";
  g.beginPath();
  g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.96);
  g.stroke();
  g.fillStyle = "#f3f6f4";
  g.textAlign = "center";
  g.font = `600 84px ${fontMono}`;
  g.fillText("96", cx, cy + 22);
  g.fillStyle = "#b7c9d8";
  g.font = `500 20px ${fontSans}`;
  g.fillText("of 100", cx, cy + 56);

  // test rows
  const rows: [string, string][] = [
    ["Display", "Passed"],
    ["Battery health", "91%"],
    ["Cameras", "Passed"],
    ["IMEI", "Clean"],
  ];
  g.textAlign = "left";
  rows.forEach(([k, v], i) => {
    const y = 548 + i * 62;
    g.fillStyle = "rgba(230,235,232,0.08)";
    g.beginPath();
    g.roundRect(38, y - 36, CW - 76, 50, 14);
    g.fill();
    g.fillStyle = "#e6ebe8";
    g.font = `500 22px ${fontSans}`;
    g.fillText(k, 58, y - 4);
    g.textAlign = "right";
    g.fillStyle = "#c5c49b";
    g.font = `500 22px ${fontMono}`;
    g.fillText(v, CW - 58, y - 4);
    g.textAlign = "left";
  });

  // price + action
  g.fillStyle = "#b7c9d8";
  g.font = `500 20px ${fontSans}`;
  g.fillText("Fair value", 38, 850);
  g.fillStyle = "#f3f6f4";
  g.font = `600 44px ${fontMono}`;
  g.fillText("PKR 61,500", 38, 900);

  g.fillStyle = "#c5c49b";
  g.beginPath();
  g.roundRect(38, 950, CW - 76, 70, 35);
  g.fill();
  g.fillStyle = "#12202d";
  g.textAlign = "center";
  g.font = `600 24px ${fontSans}`;
  g.fillText("Verified Hardware", CW / 2, 994);

  // home indicator
  g.fillStyle = "rgba(230,235,232,0.55)";
  g.beginPath();
  g.roundRect(CW / 2 - 70, CH - 34, 140, 8, 4);
  g.fill();

  if (tex) {
    tex.needsUpdate = true;
    return tex;
  }
  return toTexture(c);
}

/** Cracks radiating from the impact corner, plus dead-pixel damage. */
export function makeCrackTexture() {
  const c = makeCanvas(CW, CH);
  const g = c.getContext("2d")!;
  const rand = rng(11);
  const ox = IMPACT_UV.x * CW;
  const oy = (1 - IMPACT_UV.y) * CH;

  // dead zone around the impact
  const dead = g.createRadialGradient(ox, oy, 4, ox, oy, 150);
  dead.addColorStop(0, "rgba(4,6,10,0.96)");
  dead.addColorStop(0.55, "rgba(4,6,10,0.7)");
  dead.addColorStop(1, "rgba(4,6,10,0)");
  g.fillStyle = dead;
  g.fillRect(0, 0, CW, CH);

  // bleeding pixel lines
  const lines = [
    ["rgba(210,70,190,0.75)", 0.84],
    ["rgba(70,220,150,0.6)", 0.875],
    ["rgba(240,240,255,0.5)", 0.905],
  ] as const;
  lines.forEach(([col, ux], i) => {
    g.strokeStyle = col;
    g.lineWidth = i === 1 ? 3 : 4;
    g.beginPath();
    g.moveTo(ux * CW, 0);
    g.lineTo(ux * CW, CH);
    g.stroke();
  });

  type Pt = [number, number];
  const strands: Pt[][] = [];

  const strand = (x: number, y: number, ang: number, len: number, depth: number) => {
    const pts: Pt[] = [[x, y]];
    let cx = x;
    let cy = y;
    let a = ang;
    const step = 22 + rand() * 14;
    for (let d = 0; d < len; d += step) {
      a += (rand() - 0.5) * 0.45;
      cx += Math.cos(a) * step;
      cy += Math.sin(a) * step;
      pts.push([cx, cy]);
      if (depth < 1 && rand() < 0.07) {
        strand(cx, cy, a + (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.6), len * 0.2, depth + 1);
      }
    }
    strands.push(pts);
  };

  const rays = 6;
  for (let i = 0; i < rays; i++) {
    const t = i / (rays - 1);
    const ang = Math.PI * (1.04 + t * 0.46); // sweeps left to up
    strand(ox, oy, ang, 1500, 0); // long enough to run off the screen edge
  }

  // one concentric ring of fracture between rays
  const rings = [95];
  const web: Pt[][] = [];
  rings.forEach((rad) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 26; i++) {
      const a = Math.PI * (1.0 + (i / 26) * 0.56);
      const j = rad + (rand() - 0.5) * 12;
      pts.push([ox + Math.cos(a) * j, oy + Math.sin(a) * j]);
    }
    web.push(pts);
  });

  const stroke = (pts: Pt[], w: number, col: string, off = 0) => {
    g.strokeStyle = col;
    g.lineWidth = w;
    g.lineJoin = "round";
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x + off, y + off) : g.moveTo(x + off, y + off)));
    g.stroke();
  };

  [...strands, ...web].forEach((p) => stroke(p, 5, "rgba(6,10,14,0.55)", 2));
  [...strands, ...web].forEach((p, i) =>
    stroke(p, i < strands.length ? 3.2 : 2.2, "rgba(243,246,244,0.95)"),
  );

  return toTexture(c);
}

/** Scratches and scuffs on the back glass. */
export function makeScuffTexture() {
  const c = makeCanvas(512, 1024);
  const g = c.getContext("2d")!;
  const rand = rng(29);
  g.lineCap = "round";

  for (let i = 0; i < 26; i++) {
    const x = rand() * 512;
    const y = 380 + rand() * 640;
    const len = 30 + rand() * 120;
    const a = -0.9 + rand() * 0.5;
    g.strokeStyle = `rgba(243,246,244,${0.25 + rand() * 0.5})`;
    g.lineWidth = 0.8 + rand() * 1.2;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    g.stroke();
  }
  // grime where a thumb and a keyring would be
  const blots: [number, number, number][] = [
    [90, 930, 110],
    [400, 870, 90],
    [250, 560, 70],
  ];
  blots.forEach(([x, y, r]) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, "rgba(18,32,45,0.38)");
    gr.addColorStop(1, "rgba(18,32,45,0)");
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  });
  return toTexture(c);
}
