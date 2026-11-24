/**
 * Scroll "story" state shared between the DOM (sections) and the WebGL phone.
 *
 * Every story section carries a `data-story="<index>"` attribute. `s` is a
 * continuous position: the integer part is the section the viewport centre is
 * in, the fraction is how far through it we are. The phone's pose and its
 * repair level are pure functions of `s`.
 */

export type Pose = {
  /** horizontal offset as a fraction of viewport width (0 = centre) */
  px: number;
  /** vertical offset as a fraction of viewport height */
  py: number;
  /** phone height as a fraction of viewport height */
  h: number;
  ry: number;
  rx: number;
  rz: number;
};

export const story = {
  /** target scroll position (instant) */
  s: 0,
  /** repair level currently shown on the phone (damped, 0..1) */
  shown: 0,
  mobile: false,
  /** top of the element marked data-cover (the section that hides the phone), in viewport px */
  coverTop: Infinity,
};

const P = Math.PI;

/**
 * Phone choreography. The handset stays on the right (text is on the left) and
 * always turns in the same direction. Keys sit near each section's start and
 * end rather than at the integer indices, so it turns between sections.
 */
const k = (px: number, ry: number, o: Partial<Pose> = {}): Pose => ({
  px,
  py: 0.02,
  h: 0.7,
  ry,
  rx: 0.06,
  rz: 0,
  ...o,
});

const KEYS: [number, Pose][] = [
  // 0 hero: cracked and scuffed, angled toward the headline
  [0, k(0.26, -0.5, { rx: 0.08, rz: -0.07 })],
  [0.6, k(0.26, -0.6, { rx: 0.08, rz: -0.07 })],
  // 1 problem: the side, then the scuffed back
  [1.0, k(0.27, -1.0, { h: 0.68, rx: 0.1, rz: -0.05 })],
  [1.6, k(0.27, P - 0.05, { h: 0.68, rx: 0.04, rz: 0.04 })],
  [1.85, k(0.27, P + 0.2, { h: 0.68 })],
  // 2 solution: front, healing
  [2.1, k(0.26, 2 * P - 0.32, { h: 0.68, rx: 0.05, rz: -0.03 })],
  [2.6, k(0.27, 2 * P - 0.22, { rz: -0.03 })],
  // 3 services: the repaired back, then round to the front with the shield.
  // Everything has settled by 3.5, well before Brands slides over the phone.
  [2.95, k(0.27, 3 * P - 0.3, { rx: 0.05, rz: 0.02 })],
  [3.2, k(0.27, 3 * P - 0.15, { rx: 0.04 })],
  [3.5, k(0.27, 4 * P - 0.4, { rz: -0.03 })],
];

/** [s, repair 0..1] */
const REPAIR: [number, number][] = [
  [0, 0],
  [1, 0.08],
  [1.7, 0.25],
  [2.7, 0.95],
  [3.0, 1],
];

const smooth = (t: number) => t * t * (3 - 2 * t);

function sampleKeys<T>(
  keys: [number, T][],
  s: number,
  mix: (a: T, b: T, t: number) => T,
): T {
  if (s <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (s <= keys[i][0]) {
      const [s0, a] = keys[i - 1];
      const [s1, b] = keys[i];
      return mix(a, b, smooth((s - s0) / (s1 - s0)));
    }
  }
  return keys[keys.length - 1][1];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function poseAt(s: number, mobile: boolean): Pose {
  const p = sampleKeys(KEYS, s, (a, b, t) => ({
    px: lerp(a.px, b.px, t),
    py: lerp(a.py, b.py, t),
    h: lerp(a.h, b.h, t),
    ry: lerp(a.ry, b.ry, t),
    rx: lerp(a.rx, b.rx, t),
    rz: lerp(a.rz, b.rz, t),
  }));
  if (!mobile) return p;
  // on phones the text sits at the bottom, the handset floats above it
  return { ...p, px: 0, py: 0.2, h: p.h * 0.5 };
}

export function repairAt(s: number): number {
  return sampleKeys(REPAIR, s, (a, b, t) => lerp(a, b, t));
}

/** Read section positions from the DOM and update `story.s`. */
export function measureStory() {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>("[data-story]"),
  ).sort((a, b) => Number(a.dataset.story) - Number(b.dataset.story));
  if (!els.length) return;

  const mid = window.innerHeight * 0.5;
  let s = 0;
  for (const el of els) {
    const idx = Number(el.dataset.story);
    const r = el.getBoundingClientRect();
    if (mid >= r.top && mid < r.bottom) {
      s = idx + (mid - r.top) / Math.max(r.height, 1);
      break;
    }
    if (mid >= r.bottom) s = idx + 1;
  }
  story.s = Math.min(s, els.length);
  story.mobile = window.innerWidth < 1024;
  const cover = document.querySelector<HTMLElement>("[data-cover]");
  story.coverTop = cover ? cover.getBoundingClientRect().top : Infinity;
}
