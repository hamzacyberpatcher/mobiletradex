/**
 * Hard-coded marketplace listings for /browse and /browse/[id]. No backend.
 * Each row is written in the same fields the seller fills in on /sell, so the
 * grade, defect list, hardware report and fair value come from the same code
 * (lib/listing.ts) that built the seller's preview. What a seller sees there
 * is what a buyer sees here.
 */
import type { EvidenceKind } from "@/data/content";
import { cities, phoneBrands } from "@/data/listing";
import { defectsOf, EMPTY_DRAFT, gradeOf, runTest, suggestPrice, type Draft, type Grade, type TestRow } from "@/lib/listing";

export type SellerReview = { by: string; text: string; stars: number; evidence: EvidenceKind; when: string };

export type Seller = {
  id: string;
  name: string;
  city: string;
  since: string;
  deals: number;
  rating: number;
  /** "Usually replies within ..." */
  replies: string;
  refurbisher?: boolean;
  reviews: SellerReview[];
};

export const sellers: Record<string, Seller> = {
  s1: {
    id: "s1", name: "Hamza Qureshi", city: "Lahore", since: "March 2024", deals: 14, rating: 4.9, replies: "10 minutes",
    reviews: [
      { by: "Areeba N.", stars: 5, evidence: "box", when: "2 weeks ago", text: "Phone matched the listing exactly. Hamza brought the box and receipt to Emporium Mall and let me run my own checks before I released the payment." },
      { by: "Talha M.", stars: 5, evidence: "back", when: "2 months ago", text: "Small scuff on the frame was written in the ad and in the photos. No surprises at the meetup." },
    ],
  },
  s2: {
    id: "s2", name: "Ayesha Siddiqui", city: "Karachi", since: "June 2024", deals: 9, rating: 4.8, replies: "20 minutes",
    reviews: [
      { by: "Rizwan A.", stars: 5, evidence: "video", when: "3 weeks ago", text: "Filmed the handover at Dolmen Clifton. Battery health on the phone was exactly the percentage she listed." },
      { by: "Mehwish K.", stars: 4, evidence: "back", when: "2 months ago", text: "Quick replies and a fair price. Charger was a third-party one, which she had mentioned." },
    ],
  },
  s3: {
    id: "s3", name: "Bilal Ahmed", city: "Islamabad", since: "January 2024", deals: 21, rating: 4.7, replies: "30 minutes",
    reviews: [
      { by: "Hassan R.", stars: 5, evidence: "box", when: "1 week ago", text: "Third phone I have bought from Bilal. Everything on the hardware report was true when I tested it myself." },
      { by: "Noor F.", stars: 4, evidence: "crack", when: "1 month ago", text: "He had listed the replaced panel clearly, so I knew what I was paying for. Price came down a little after I made an offer." },
    ],
  },
  s4: {
    id: "s4", name: "Sana Malik", city: "Lahore", since: "August 2024", deals: 5, rating: 5.0, replies: "15 minutes",
    reviews: [
      { by: "Faizan S.", stars: 5, evidence: "box", when: "10 days ago", text: "Sealed accessories, box in perfect shape. Paid through escrow and released it after checking the IMEI in the dialer." },
      { by: "Hira B.", stars: 5, evidence: "back", when: "6 weeks ago", text: "Looked brand new. Sana was easy to talk to and kept to the time we agreed." },
    ],
  },
  s5: {
    id: "s5", name: "Usman Tariq", city: "Faisalabad", since: "October 2024", deals: 3, rating: 4.6, replies: "1 hour",
    reviews: [
      { by: "Adnan Z.", stars: 5, evidence: "back", when: "1 month ago", text: "Honest about the scratches. Met at Lyallpur Galleria and it all went smoothly." },
      { by: "Kinza H.", stars: 4, evidence: "box", when: "2 months ago", text: "Phone was as described. He replied slowly on the first day but was reliable after that." },
    ],
  },
  s6: {
    id: "s6", name: "Fahad Raza", city: "Karachi", since: "November 2023", deals: 48, rating: 4.5, replies: "1 hour", refurbisher: true,
    reviews: [
      { by: "Shayan D.", stars: 5, evidence: "video", when: "5 days ago", text: "Refurbisher. Every repair was listed with the part used. He showed me the test screen before I paid." },
      { by: "Maria Q.", stars: 4, evidence: "crack", when: "1 month ago", text: "Cheaper than other shops because it is not perfect, and he says so up front. Fair deal." },
    ],
  },
  s7: {
    id: "s7", name: "Zainab Khan", city: "Multan", since: "September 2024", deals: 2, rating: 4.8, replies: "45 minutes",
    reviews: [
      { by: "Omer P.", stars: 5, evidence: "box", when: "3 weeks ago", text: "Met at Mall of Multan, tested everything on the spot. She had the receipt ready." },
    ],
  },
  s8: {
    id: "s8", name: "Danish Iqbal", city: "Islamabad", since: "November 2026", deals: 0, rating: 0, replies: "2 hours",
    reviews: [],
  },
};

type Raw = {
  brand: string;
  model: string;
  storage: string;
  ram: string;
  color: string;
  /** asking price relative to the fair value, in percent */
  off: number;
  city: string;
  seller: string;
  days: number;
  age: string;
  note: string;
  battery: number;
  pta?: string;
  screen?: "flawless" | "scratched" | "cracked";
  body?: "mint" | "minor" | "dents";
  panel?: "original" | "replaced";
  issues?: string[];
  acc?: string[];
  pay?: "escrow" | "cod" | "both";
  neg?: boolean;
  status?: "available" | "reserved" | "sold";
  /** false = the seller has not run the hardware test, so no Verified badge */
  tested?: boolean;
};

const ALL = ["box", "charger", "receipt", "case"];
const BC = ["box", "charger"];

const raw: Raw[] = [
  { brand: "apple", model: "iPhone 13", storage: "128 GB", ram: "4 GB", color: "Blue", off: -4, city: "Lahore", seller: "s1", days: 2, age: "1to2", battery: 89, acc: ALL, note: "Never opened or repaired. Used with a case and tempered glass from the first day. Box, charger and the Mobile Mall receipt are with me." },
  { brand: "apple", model: "iPhone 14 Pro", storage: "256 GB", ram: "6 GB", color: "Purple", off: 1, city: "Karachi", seller: "s2", days: 1, age: "6to12", battery: 94, acc: ALL, pay: "escrow", neg: false, note: "Deep Purple, bought from the Apple reseller at Dolmen Clifton. No marks anywhere. Selling because I am moving to a work phone." },
  { brand: "apple", model: "iPhone 11", storage: "64 GB", ram: "4 GB", color: "Black", off: -8, city: "Faisalabad", seller: "s5", days: 6, age: "2to3", battery: 79, pta: "jv", screen: "scratched", body: "minor", acc: ["charger"], note: "Factory unlocked, works with all local SIMs. Fine scratches on the glass that you can only see in bright light. Face ID works." },
  { brand: "apple", model: "iPhone 12", storage: "128 GB", ram: "4 GB", color: "White", off: -10, city: "Islamabad", seller: "s3", days: 4, age: "1to2", battery: 83, screen: "scratched", body: "minor", panel: "replaced", acc: BC, pay: "escrow", note: "Screen was replaced at a repair shop in Hafeez Centre after a drop. True Tone is off since the replacement. Everything else is original." },
  { brand: "apple", model: "iPhone 14", storage: "128 GB", ram: "6 GB", color: "Black", off: 2, city: "Lahore", seller: "s4", days: 3, age: "lt6", battery: 97, acc: ALL, pay: "escrow", neg: false, note: "Bought in May. Always in a case. Original box is in perfect shape and the cable has never been used." },
  { brand: "apple", model: "iPhone 12", storage: "64 GB", ram: "4 GB", color: "Red", off: -22, city: "Karachi", seller: "s6", days: 9, age: "2to3", battery: 74, pta: "non-pta", screen: "cracked", body: "dents", issues: ["faceid"], acc: [], pay: "cod", note: "Cracked screen and a dented frame from a fall. Face ID has stopped working. Priced for a buyer who will repair it or use it for parts." },
  { brand: "samsung", model: "Galaxy S23", storage: "256 GB", ram: "8 GB", color: "Green", off: 0, city: "Lahore", seller: "s1", days: 2, age: "lt6", battery: 96, acc: ALL, pay: "escrow", note: "Bought in March, used with a case. Samsung warranty is valid until next March. Selling to buy an iPhone." },
  { brand: "samsung", model: "Galaxy A54", storage: "128 GB", ram: "8 GB", color: "Blue", off: -5, city: "Islamabad", seller: "s3", days: 5, age: "6to12", battery: 91, body: "minor", acc: BC, note: "Light paint wear on one corner of the frame. Screen is spotless and has a glass protector on it." },
  { brand: "samsung", model: "Galaxy S21", storage: "128 GB", ram: "8 GB", color: "Silver", off: -9, city: "Multan", seller: "s7", days: 11, age: "2to3", battery: 82, screen: "scratched", body: "minor", acc: ["charger", "case"], pay: "cod", note: "Reliable phone, but the screen has fine scratches. Battery lasts a full working day." },
  { brand: "samsung", model: "Galaxy S22 Ultra", storage: "256 GB", ram: "12 GB", color: "Black", off: -6, city: "Karachi", seller: "s2", days: 7, age: "1to2", battery: 86, body: "minor", acc: ALL, note: "S Pen is included and works. One small scuff on the bottom edge, shown in the photo of the sides." },
  { brand: "samsung", model: "Galaxy A14", storage: "64 GB", ram: "4 GB", color: "Black", off: -4, city: "Faisalabad", seller: "s5", days: 3, age: "6to12", battery: 88, body: "minor", acc: ["charger"], pay: "cod", tested: false, note: "Simple everyday phone. I have not run the hardware test, so inspect it carefully at the meetup." },
  { brand: "samsung", model: "Galaxy S21", storage: "256 GB", ram: "8 GB", color: "Purple", off: -18, city: "Lahore", seller: "s6", days: 14, age: "2to3", battery: 77, pta: "jv", screen: "cracked", body: "minor", panel: "replaced", issues: ["speaker"], acc: [], pay: "cod", note: "Back glass replaced, front screen has a crack in one corner. The bottom speaker is quiet. Sold with a 7-day check at my shop." },
  { brand: "xiaomi", model: "Redmi Note 12", storage: "128 GB", ram: "6 GB", color: "Blue", off: -3, city: "Lahore", seller: "s4", days: 2, age: "6to12", battery: 92, acc: BC, note: "Perfect condition, used mostly at home. Comes with the 33W charger that came in the box." },
  { brand: "xiaomi", model: "Redmi Note 13 Pro", storage: "256 GB", ram: "8 GB", color: "Black", off: 1, city: "Islamabad", seller: "s3", days: 1, age: "lt6", battery: 98, acc: ALL, pay: "escrow", note: "Four months old. Selling because I received a company phone. Includes the case and two screen protectors." },
  { brand: "xiaomi", model: "Poco X5 Pro", storage: "128 GB", ram: "6 GB", color: "Green", off: -7, city: "Karachi", seller: "s2", days: 8, age: "1to2", battery: 84, screen: "scratched", body: "minor", acc: ["charger"], note: "Great for gaming. The screen has light scratches and the frame has small marks. All sensors work." },
  { brand: "xiaomi", model: "Redmi Note 11", storage: "64 GB", ram: "4 GB", color: "Gold", off: -12, city: "Multan", seller: "s7", days: 12, age: "2to3", battery: 78, screen: "scratched", body: "dents", issues: ["charging"], acc: [], pay: "cod", note: "The charging port is loose, so it only charges if the cable is held at an angle. Priced low for that reason." },
  { brand: "oppo", model: "Reno 8", storage: "128 GB", ram: "8 GB", color: "Gold", off: -5, city: "Lahore", seller: "s1", days: 6, age: "1to2", battery: 87, body: "minor", acc: BC, note: "Good camera phone. Back has a few hairline marks from keys. Screen is clean." },
  { brand: "oppo", model: "A57", storage: "64 GB", ram: "4 GB", color: "Black", off: -8, city: "Faisalabad", seller: "s5", days: 9, age: "1to2", battery: 85, screen: "scratched", body: "minor", acc: ["charger", "case"], pay: "cod", note: "Used by my mother for calls and WhatsApp. Scratches on the screen are shallow." },
  { brand: "vivo", model: "V25", storage: "128 GB", ram: "8 GB", color: "Blue", off: -4, city: "Karachi", seller: "s2", days: 4, age: "1to2", battery: 90, acc: BC, note: "The colour-changing back panel still works. No marks, no repairs." },
  { brand: "vivo", model: "Y36", storage: "128 GB", ram: "8 GB", color: "Green", off: -2, city: "Islamabad", seller: "s8", days: 2, age: "lt6", battery: 96, acc: ALL, pay: "escrow", note: "My first listing on MobileTradeX. Phone is five months old and I have the receipt." },
  { brand: "realme", model: "11 Pro", storage: "256 GB", ram: "8 GB", color: "Gold", off: -3, city: "Lahore", seller: "s4", days: 3, age: "6to12", battery: 93, acc: ALL, note: "Curved display, no scratches. Fast charger and box included." },
  { brand: "infinix", model: "Note 30", storage: "128 GB", ram: "8 GB", color: "Blue", off: -6, city: "Multan", seller: "s7", days: 5, age: "6to12", battery: 89, screen: "scratched", body: "minor", acc: BC, pay: "cod", note: "Light scratches on the screen. Battery easily lasts two days." },
  { brand: "infinix", model: "Zero 30", storage: "256 GB", ram: "12 GB", color: "Silver", off: -2, city: "Karachi", seller: "s6", days: 1, age: "lt6", battery: 95, acc: ALL, note: "Refurbished unit from my shop. Tested for 48 hours before listing. Warranty from me for 7 days." },
  { brand: "tecno", model: "Camon 20", storage: "256 GB", ram: "8 GB", color: "Black", off: -5, city: "Faisalabad", seller: "s5", days: 7, age: "6to12", battery: 90, body: "minor", acc: BC, note: "Phone has been used with a cover all the time. A faint mark on the frame near the power button." },
  { brand: "tecno", model: "Phantom X2", storage: "256 GB", ram: "12 GB", color: "Purple", off: -7, city: "Islamabad", seller: "s3", days: 10, age: "1to2", battery: 88, acc: ALL, pay: "escrow", note: "Flagship from Tecno with the portrait camera system. Perfect screen, back has no scratches." },
  { brand: "googlepixel", model: "Pixel 7", storage: "128 GB", ram: "8 GB", color: "Green", off: -6, city: "Lahore", seller: "s1", days: 4, age: "1to2", battery: 87, pta: "jv", body: "minor", acc: ["charger", "case"], note: "Works on all local networks without PTA registration. Camera is excellent for the price. Small mark on the camera bar." },
  { brand: "oneplus", model: "10 Pro", storage: "256 GB", ram: "12 GB", color: "Black", off: -8, city: "Karachi", seller: "s2", days: 13, age: "1to2", battery: 83, pta: "jv", screen: "scratched", body: "minor", acc: BC, note: "Smooth Hasselblad camera and quick charging. Screen has a few fine scratches and a screen protector is not on it." },
  { brand: "oneplus", model: "9", storage: "128 GB", ram: "8 GB", color: "Blue", off: -9, city: "Islamabad", seller: "s8", days: 8, age: "2to3", battery: 80, body: "minor", panel: "replaced", acc: ["charger"], note: "I replaced the screen last year at an OnePlus-authorised repair centre. Works perfectly since then." },
  { brand: "huawei", model: "P30 Pro", storage: "256 GB", ram: "8 GB", color: "Silver", off: -15, city: "Lahore", seller: "s6", days: 16, age: "3plus", battery: 76, pta: "non-pta", screen: "scratched", body: "minor", acc: [], pay: "cod", tested: false, note: "Still has one of the best zoom cameras. No Google services. Not PTA registered, so it needs a local SIM that works with it." },
  { brand: "honor", model: "90", storage: "256 GB", ram: "12 GB", color: "Green", off: -1, city: "Lahore", seller: "s4", days: 2, age: "lt6", battery: 97, acc: ALL, pay: "escrow", note: "Bought four months ago. Includes the 66W charger and the original box. Not a single mark." },
  { brand: "motorola", model: "Moto G54", storage: "128 GB", ram: "8 GB", color: "Blue", off: -4, city: "Multan", seller: "s7", days: 6, age: "6to12", battery: 94, acc: BC, pay: "both", note: "Clean stock Android. Comes with the box and charger. Battery easily lasts a day and a half." },
  { brand: "nokia", model: "G21", storage: "64 GB", ram: "4 GB", color: "Gold", off: -10, city: "Faisalabad", seller: "s5", days: 15, age: "1to2", battery: 81, screen: "scratched", body: "minor", acc: ["charger"], status: "sold", pay: "cod", note: "Sold. This listing stays visible for a few days so you can compare prices." },
  { brand: "itel", model: "S23", storage: "128 GB", ram: "8 GB", color: "Black", off: -3, city: "Karachi", seller: "s6", days: 2, age: "lt6", battery: 96, acc: BC, note: "Budget phone in a very clean state. Refurbished and tested in my shop." },
  { brand: "sony", model: "Xperia 1 III", storage: "256 GB", ram: "12 GB", color: "Black", off: -10, city: "Islamabad", seller: "s3", days: 18, age: "2to3", battery: 84, pta: "jv", body: "minor", status: "reserved", acc: ["charger", "case"], note: "A 4K display and a headphone jack. Reserved for a buyer who is collecting it this Saturday." },
  { brand: "apple", model: "iPhone 14 Pro", storage: "128 GB", ram: "6 GB", color: "Gold", off: -4, city: "Karachi", seller: "s2", days: 5, age: "1to2", battery: 86, screen: "scratched", body: "minor", acc: BC, note: "Used with a case. Light scratches on the glass and small marks on the steel frame. Dynamic Island works as it should." },
  { brand: "samsung", model: "Galaxy S23", storage: "128 GB", ram: "8 GB", color: "Black", off: -2, city: "Islamabad", seller: "s8", days: 1, age: "6to12", battery: 93, acc: BC, pay: "escrow", tested: false, note: "First time selling here, so I have not done the hardware test yet. Happy for you to run it with me at the meetup." },
];

export type Listing = {
  id: string;
  brand: string;
  brandName: string;
  model: string;
  title: string;
  storage: string;
  ram: string;
  color: string;
  pta: string;
  age: string;
  accessories: string[];
  screen: string;
  body: string;
  panel: string;
  battery: number;
  issues: string[];
  note: string;
  imei: string;
  price: number;
  fair: number;
  negotiable: boolean;
  payment: "escrow" | "cod" | "both";
  city: string;
  meetup: string;
  days: number;
  status: "available" | "reserved" | "sold";
  seller: Seller;
  grade: Grade;
  defects: string[];
  tested: boolean;
  score: number | null;
  tests: TestRow[] | null;
  /** photo slots shown in the gallery */
  shots: string[];
};

/** 15-digit IMEI that passes the Luhn check, so the seeded listings pass the same IMEI check as real ones. */
function imeiFor(n: number) {
  const body = `35${String(693800 + n * 7919).padStart(6, "0")}${String(100000 + n * 37).slice(-6)}`;
  const tail = body.slice(0, 14);
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = Number(tail[13 - i]);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return tail + ((10 - (sum % 10)) % 10);
}

const toDraft = (l: Pick<Listing, "brand" | "model" | "storage" | "ram" | "pta" | "age" | "accessories" | "screen" | "body" | "panel" | "battery" | "issues" | "imei">): Draft => ({
  ...EMPTY_DRAFT,
  brand: l.brand,
  model: l.model,
  storage: l.storage,
  ram: l.ram,
  pta: l.pta,
  age: l.age,
  accessories: l.accessories,
  screen: l.screen,
  body: l.body,
  panel: l.panel,
  battery: l.battery,
  issues: l.issues,
  imei: l.imei,
  testSig: "x",
});

export const listings: Listing[] = raw.map((r, i) => {
  const brand = phoneBrands.find((b) => b.slug === r.brand)!;
  const base = {
    brand: r.brand,
    model: r.model,
    storage: r.storage,
    ram: r.ram,
    pta: r.pta ?? "approved",
    age: r.age,
    accessories: r.acc ?? [],
    screen: r.screen ?? "flawless",
    body: r.body ?? "mint",
    panel: r.panel ?? "original",
    battery: r.battery,
    issues: r.issues ?? [],
    imei: imeiFor(i + 1),
  };
  const d = toDraft(base);
  const fair = suggestPrice(d)!.fair;
  const tested = r.tested !== false;
  const result = tested ? runTest(d) : null;
  const zones = cities.find((c) => c.name === r.city)?.zones ?? [];
  return {
    id: String(2401 + i),
    ...base,
    brandName: brand.name,
    title: `${brand.name} ${r.model}`,
    color: r.color,
    note: r.note,
    fair,
    price: Math.round((fair * (1 + r.off / 100)) / 500) * 500,
    negotiable: r.neg ?? true,
    payment: r.pay ?? "both",
    city: r.city,
    meetup: zones[i % zones.length] ?? "A public place near the city centre",
    days: r.days,
    status: r.status ?? "available",
    seller: sellers[r.seller],
    grade: gradeOf(d)!,
    defects: defectsOf(d),
    tested,
    score: result?.score ?? null,
    tests: result?.rows ?? null,
    shots: ["front", "back", "screenOn", "sides", ...(base.accessories.includes("box") ? ["extras"] : [])],
  };
});

export const listingById = (id: string) => listings.find((l) => l.id === id);

export const shotLabels: Record<string, string> = {
  front: "Front, screen off",
  back: "Back",
  screenOn: "Front, screen on",
  sides: "Sides and corners",
  extras: "Box and accessories",
};
