import { ageOptions, issueOptions, phoneBrands, type PhoneModel } from "@/data/listing";

/** Everything the seller enters. Saved to localStorage as a draft (photos are not). */
export type Draft = {
  name: string;
  cnic: string;
  phone: string;
  idVerified: boolean;
  brand: string;
  model: string;
  storage: string;
  ram: string;
  color: string;
  pta: string;
  imei: string;
  variant: string;
  age: string;
  accessories: string[];
  screen: string;
  body: string;
  panel: string;
  battery: number;
  issues: string[];
  note: string;
  /** condition signature the hardware test was run against ("" = not run) */
  testSig: string;
  price: string;
  negotiable: boolean;
  payment: string;
  city: string;
  meetup: string;
  terms: boolean;
};

export const EMPTY_DRAFT: Draft = {
  name: "",
  cnic: "",
  phone: "",
  idVerified: false,
  brand: "",
  model: "",
  storage: "",
  ram: "",
  color: "",
  pta: "",
  imei: "",
  variant: "",
  age: "",
  accessories: [],
  screen: "",
  body: "",
  panel: "",
  battery: 88,
  issues: [],
  note: "",
  testSig: "",
  price: "",
  negotiable: true,
  payment: "escrow",
  city: "",
  meetup: "",
  terms: false,
};

export type Photos = Record<string, { url: string; name: string }>;
export type Errors = Record<string, string>;

/* ---------- formatting ---------- */

export const digits = (s: string) => s.replace(/\D/g, "");

export function formatCnic(s: string) {
  const d = digits(s).slice(0, 13);
  if (d.length <= 5) return d;
  if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
}

export function formatPhone(s: string) {
  const d = digits(s).slice(0, 11);
  return d.length <= 4 ? d : `${d.slice(0, 4)}-${d.slice(4)}`;
}

export const rs = (n: number) => `Rs ${Math.round(n).toLocaleString("en-US")}`;

export function luhn(num: string) {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/* ---------- lookups ---------- */

export const brandOf = (d: Draft) => phoneBrands.find((b) => b.slug === d.brand);
export const modelOf = (d: Draft): PhoneModel | undefined => brandOf(d)?.models.find((m) => m.name === d.model);

export function deviceTitle(d: Draft) {
  const b = brandOf(d);
  if (!b || !d.model) return "";
  return `${b.name} ${d.model}`;
}

/* ---------- condition grade ---------- */

export type Grade = "Like new" | "Good" | "Fair" | "Needs repair";

export function gradeOf(d: Draft): Grade | null {
  if (!d.screen || !d.body || !d.panel) return null;
  let p = 0;
  p += d.screen === "cracked" ? 3 : d.screen === "scratched" ? 1 : 0;
  p += d.body === "dents" ? 2 : d.body === "minor" ? 1 : 0;
  p += d.panel === "replaced" ? 1 : 0;
  p += d.issues.length;
  p += d.battery < 75 ? 1 : 0;
  if (p === 0 && d.battery >= 85) return "Like new";
  if (p <= 2) return "Good";
  if (p <= 4) return "Fair";
  return "Needs repair";
}

/** Defects in plain words, shown first in the preview and review (buyers asked for this). */
export function defectsOf(d: Draft): string[] {
  const out: string[] = [];
  if (d.screen === "cracked") out.push("Cracked or chipped screen");
  if (d.screen === "scratched") out.push("Light scratches on the screen");
  if (d.body === "dents") out.push("Dents or bent frame");
  if (d.body === "minor") out.push("Minor marks on the body");
  if (d.panel === "replaced") out.push("Screen or panel replaced");
  for (const i of d.issues) {
    const o = issueOptions.find((x) => x.value === i);
    if (o) out.push(`${o.label} not working properly`);
  }
  if (d.battery < 80) out.push(`Battery health ${d.battery}%`);
  return out;
}

/* ---------- hardware test (simulated) ---------- */

export type TestRow = { id: string; label: string; ok: boolean; detail: string };

export function testSig(d: Draft) {
  return JSON.stringify([d.brand, d.model, d.storage, d.imei, d.screen, d.body, d.panel, d.battery, [...d.issues].sort()]);
}

export function runTest(d: Draft): { rows: TestRow[]; score: number } {
  const has = (id: string) => d.issues.some((i) => issueOptions.find((o) => o.value === i)?.test === id);
  const imeiOk = d.imei.length === 15 && luhn(d.imei);
  const rows: TestRow[] = [
    {
      id: "imei",
      label: "IMEI check",
      ok: imeiOk,
      detail: imeiOk ? `IMEI ${d.imei.slice(0, 4)}••••••••${d.imei.slice(-3)} is valid and not reported stolen` : "IMEI did not pass the checksum",
    },
    {
      id: "screen",
      label: "Screen and touch",
      ok: d.screen !== "cracked",
      detail: d.screen === "cracked" ? "Touch works, but the cracked glass is recorded on the report" : "Every area of the panel responded to touch",
    },
    {
      id: "audio",
      label: "Speakers and microphone",
      ok: !has("audio"),
      detail: has("audio") ? "Audio fault confirmed, as you reported" : "Both speakers and the microphone recorded clearly",
    },
    {
      id: "cameras",
      label: "Cameras and biometrics",
      ok: !has("cameras"),
      detail: has("cameras") ? "Camera or biometric fault confirmed, as you reported" : "Front, rear cameras and unlock sensor work",
    },
    {
      id: "battery",
      label: "Battery and charging",
      ok: !has("battery") && d.battery >= 80,
      detail: has("battery") ? "Charging fault confirmed, as you reported" : `Battery health ${d.battery}%, charges normally`,
    },
    {
      id: "radio",
      label: "Wi-Fi, SIM and sensors",
      ok: !has("radio"),
      detail: has("radio") ? "Signal or sensor fault confirmed, as you reported" : "Wi-Fi, SIM signal, buttons and sensors work",
    },
  ];
  let score = 100;
  for (const r of rows) if (!r.ok) score -= r.id === "imei" ? 25 : 8;
  if (d.screen === "cracked") score -= 4;
  if (d.battery < 80) score -= 4;
  return { rows, score: Math.max(40, score) };
}

export const testIsFresh = (d: Draft) => d.testSig !== "" && d.testSig === testSig(d);

/* ---------- fair price ---------- */

export type PriceFactor = { label: string; pct: number };

const STORAGE_MULT: Record<string, number> = { "64 GB": 0.88, "128 GB": 1, "256 GB": 1.12, "512 GB": 1.28, "1 TB": 1.45 };
const AGE_MULT: Record<string, number> = { lt6: 1.04, "6to12": 1, "1to2": 0.94, "2to3": 0.88, "3plus": 0.8 };
const PTA_MULT: Record<string, number> = { approved: 1, jv: 0.82, "non-pta": 0.7 };

export function suggestPrice(d: Draft) {
  const m = modelOf(d);
  if (!m) return null;
  const f: PriceFactor[] = [];
  const add = (label: string, mult: number) => {
    if (Math.abs(mult - 1) > 0.001) f.push({ label, pct: Math.round((mult - 1) * 100) });
    return mult;
  };
  let v = m.base;
  v *= add(`${d.storage || "Storage"} version`, STORAGE_MULT[d.storage] ?? 1);
  v *= add("PTA status", PTA_MULT[d.pta] ?? 1);
  v *= add(`Age: ${ageOptions.find((a) => a.value === d.age)?.label.toLowerCase() ?? "unknown"}`, AGE_MULT[d.age] ?? 1);
  const g = gradeOf(d);
  v *= add(`Condition: ${g?.toLowerCase() ?? "not set"}`, g === "Like new" ? 1.06 : g === "Fair" ? 0.88 : g === "Needs repair" ? 0.68 : 1);
  v *= add("Battery health", d.battery >= 90 ? 1.02 : d.battery >= 80 ? 1 : d.battery >= 70 ? 0.95 : 0.9);
  v *= add("Original box and charger", d.accessories.includes("box") && d.accessories.includes("charger") ? 1.02 : 1);
  const t = d.testSig && testIsFresh(d) ? runTest(d).score : null;
  if (t !== null) v *= add("Hardware test score", t >= 90 ? 1.03 : t < 80 ? 0.96 : 1);
  const round = (x: number) => Math.round(x / 500) * 500;
  return { low: round(v * 0.92), fair: round(v), high: round(v * 1.08), factors: f, base: m.base };
}

/* ---------- validation per step ---------- */

export const REQUIRED_PHOTOS = ["front", "back", "screenOn", "sides"];

export function validate(step: number, d: Draft, photos: Photos): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (d.name.trim().length < 3 || !/[a-z]/i.test(d.name)) e.name = "Enter your full name as it appears on your CNIC.";
    if (digits(d.cnic).length !== 13) e.cnic = "A CNIC has 13 digits, for example 35202-1234567-1.";
    if (!/^03\d{9}$/.test(digits(d.phone))) e.phone = "Enter an 11-digit mobile number starting with 03.";
    if (!d.idVerified) e.verify = "Verify your CNIC and mobile number to continue.";
  }
  if (step === 1) {
    const m = modelOf(d);
    if (!d.brand) e.brand = "Choose your phone's brand.";
    else if (!m) e.model = "Choose your model from the list.";
    if (m && !d.storage) e.storage = "Choose the storage size.";
    if (m && !d.ram) e.ram = "Choose the RAM.";
    if (!d.color) e.color = "Choose the colour.";
    if (!d.pta) e.pta = "Tell buyers whether the phone is PTA approved.";
    if (digits(d.imei).length !== 15) e.imei = `The IMEI has 15 digits (you entered ${digits(d.imei).length}). Dial *#06# to see it.`;
    else if (!luhn(d.imei)) e.imei = "This IMEI is not valid. Check each digit against *#06#.";
    if (!d.age) e.age = "Choose how long you have used the phone.";
  }
  if (step === 2) {
    if (!d.screen) e.screen = "Describe the screen.";
    if (!d.body) e.body = "Describe the frame and back.";
    if (!d.panel) e.panel = "Say whether any part has been replaced.";
  }
  if (step === 3) {
    if (!testIsFresh(d)) e.test = d.testSig ? "Your details changed after the test. Run it again." : "Run the hardware test to continue.";
  }
  if (step === 4) {
    const missing = REQUIRED_PHOTOS.filter((id) => !photos[id]);
    if (missing.length) e.photos = `Add ${missing.length} more required photo${missing.length > 1 ? "s" : ""} to continue.`;
  }
  if (step === 5) {
    const p = Number(digits(d.price));
    if (!d.price) e.price = "Enter the price you want to receive.";
    else if (p < 2000) e.price = "Prices start from Rs 2,000.";
    else if (p > 1500000) e.price = "Prices go up to Rs 1,500,000. Check for an extra zero.";
    if (!d.city) e.city = "Choose your city.";
    if (d.city && !d.meetup) e.meetup = "Choose a safe meetup zone.";
  }
  if (step === 6) {
    if (!d.terms) e.terms = "Confirm the details are accurate before publishing.";
  }
  return e;
}

export const DRAFT_KEY = "mtx-listing-draft";
export type Saved = { draft: Draft; step: number; maxStep: number };
