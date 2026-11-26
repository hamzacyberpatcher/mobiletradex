import { ageOptions, issueOptions, phoneBrands, type Box, type PhoneModel } from "@/data/listing";

/** Everything the seller enters. Saved to localStorage as a draft (photos are not). */
export type Draft = {
  name: string;
  cnic: string;
  phone: string;
  idVerified: boolean;
  brand: string;
  model: string;
  /** model typed by hand because it is not in our list */
  customModel: boolean;
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
  /** city typed or searched because it is not in our list */
  cityCustom: boolean;
  /** the typed or searched city was checked and is in Pakistan */
  cityVerified: boolean;
  /** outline of that city (Google Places only), limits the meetup search */
  cityBox: Box | null;
  meetup: string;
  /** meetup place searched or typed instead of one of our safe zones */
  meetupCustom: boolean;
  terms: boolean;
};

export const EMPTY_DRAFT: Draft = {
  name: "",
  cnic: "",
  phone: "",
  idVerified: false,
  brand: "",
  model: "",
  customModel: false,
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
  cityCustom: false,
  cityVerified: false,
  cityBox: null,
  meetup: "",
  meetupCustom: false,
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

/* ---------- live field checks ---------- */

/**
 * One rule per text box. `error` is a mistake (shown red as soon as it happens);
 * `hint` is just "not finished yet" (shown grey, e.g. "5 of 13 digits").
 */
export type Check = { ok: boolean; error?: string; hint?: string };

const count = (n: number, of: number, unit = "digits") => `${n} of ${of} ${unit}`;

export const check = {
  name(v: string): Check {
    if (/[^\p{L}\s.'-]/u.test(v)) return { ok: false, error: "Names can only contain letters and spaces." };
    const n = (v.match(/\p{L}/gu) ?? []).length;
    return n >= 3 ? { ok: true } : { ok: false, hint: `${count(n, 3, "letters")} so far, keep typing` };
  },
  cnic(v: string): Check {
    const d = digits(v);
    if (d && !/^[1-8]/.test(d)) return { ok: false, error: "A CNIC starts with a digit from 1 to 8, not 0 or 9." };
    if (d.length === 13 && /^(\d)\1+$/.test(d)) return { ok: false, error: "This CNIC does not look right. Check every digit against your card." };
    return d.length === 13 ? { ok: true } : { ok: false, hint: count(d.length, 13) };
  },
  phone(v: string): Check {
    const d = digits(v);
    if ((d.length >= 1 && d[0] !== "0") || (d.length >= 2 && d[1] !== "3")) return { ok: false, error: "Mobile numbers in Pakistan start with 03, for example 0300-1234567." };
    return d.length === 11 ? { ok: true } : { ok: false, hint: count(d.length, 11) };
  },
  imei(v: string): Check {
    const d = digits(v);
    if (d.length === 15 && !luhn(d)) return { ok: false, error: "This IMEI is not valid. Check each digit against *#06#." };
    return d.length === 15 ? { ok: true } : { ok: false, hint: count(d.length, 15) };
  },
  model(v: string): Check {
    if (/[^\p{L}\p{N}\s.\-+/()]/u.test(v)) return { ok: false, error: "Model names can only contain letters, numbers and - + . / ( )." };
    return v.trim().length >= 2 ? { ok: true } : { ok: false, hint: "Enter at least 2 characters" };
  },
  price(v: string): Check {
    const p = Number(digits(v));
    if (p > 1500000) return { ok: false, error: "Prices go up to Rs 1,500,000. Check for an extra zero." };
    return p >= 2000 ? { ok: true } : { ok: false, hint: "The lowest price is Rs 2,000" };
  },
  place(v: string): Check {
    return v.trim().length >= 3 ? { ok: true } : { ok: false, hint: "Enter at least 3 characters" };
  },
};

/** Text boxes whose problems show live: error key -> current value and its rule. */
function liveFields(d: Draft): Record<string, [string, Check]> {
  const f: Record<string, [string, Check]> = {
    name: [d.name, check.name(d.name)],
    cnic: [d.cnic, check.cnic(d.cnic)],
    phone: [d.phone, check.phone(d.phone)],
    imei: [d.imei, check.imei(d.imei)],
    price: [d.price, check.price(d.price)],
  };
  if (d.customModel) f.model = [d.model, check.model(d.model)];
  if (d.meetupCustom) f.meetup = [d.meetup, check.place(d.meetup)];
  return f;
}

/** What to show under each non-empty text box right now. Empty boxes show nothing. */
export function live(d: Draft): { errors: Errors; hints: Errors } {
  const errors: Errors = {};
  const hints: Errors = {};
  for (const [key, [value, c]] of Object.entries(liveFields(d))) {
    if (!value.trim() || c.ok) continue;
    if (c.error) errors[key] = c.error;
    else if (c.hint) hints[key] = c.hint;
  }
  return { errors, hints };
}

/** Short names for the "Still needed" line next to Continue. */
export const FIELD_LABELS: Record<string, string> = {
  name: "your name", cnic: "CNIC", phone: "mobile number", verify: "identity check", brand: "brand", model: "model",
  storage: "storage", ram: "RAM", color: "colour", pta: "PTA status", imei: "IMEI", age: "how long you used it",
  screen: "screen", body: "frame and back", panel: "repairs", test: "hardware test", photos: "required photos",
  price: "asking price", city: "city", meetup: "meetup place", terms: "your confirmation",
};

/* ---------- validation per step ---------- */

export const REQUIRED_PHOTOS = ["front", "back", "screenOn", "sides"];

export function validate(step: number, d: Draft, photos: Photos): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!check.name(d.name).ok) e.name = check.name(d.name).error ?? "Enter your full name as it appears on your CNIC.";
    if (!check.cnic(d.cnic).ok) e.cnic = check.cnic(d.cnic).error ?? "A CNIC has 13 digits, for example 35202-1234567-1.";
    if (!check.phone(d.phone).ok) e.phone = check.phone(d.phone).error ?? "Enter an 11-digit mobile number starting with 03.";
    if (!d.idVerified) e.verify = "Verify your CNIC and mobile number to continue.";
  }
  if (step === 1) {
    const m = modelOf(d);
    if (!d.brand) e.brand = "Choose your phone's brand.";
    else if (d.customModel) {
      if (!check.model(d.model).ok) e.model = check.model(d.model).error ?? "Enter your phone's model name, as shown in Settings, About phone.";
    } else if (!m) e.model = "Choose your model, or pick \"My model isn't listed\".";
    if ((m || d.customModel) && !d.storage) e.storage = "Choose the storage size.";
    if ((m || d.customModel) && !d.ram) e.ram = "Choose the RAM.";
    if (!d.color) e.color = "Choose the colour.";
    if (!d.pta) e.pta = "Tell buyers whether the phone is PTA approved.";
    if (!check.imei(d.imei).ok) e.imei = check.imei(d.imei).error ?? `The IMEI has 15 digits (you entered ${digits(d.imei).length}). Dial *#06# to see it.`;
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
    if (!check.price(d.price).ok) e.price = check.price(d.price).error ?? (d.price ? "Prices start from Rs 2,000." : "Enter the price you want to receive.");
    if (!d.city.trim()) e.city = d.cityCustom ? "Enter or search for your city." : "Choose your city.";
    else if (d.cityCustom && !d.cityVerified) e.city = "Pick a city in Pakistan from the suggestions, or type its exact name.";
    else if (!d.meetup.trim() || (d.meetupCustom && !check.place(d.meetup).ok)) e.meetup = d.meetupCustom ? "Search for or type the meetup place." : "Choose a meetup place.";
  }
  if (step === 6) {
    if (!d.terms) e.terms = "Confirm the details are accurate before publishing.";
  }
  return e;
}

export const DRAFT_KEY = "mtx-listing-draft";
export type Saved = { draft: Draft; step: number; maxStep: number };
