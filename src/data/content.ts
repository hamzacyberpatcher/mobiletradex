export const services = [
  {
    title: "Fair value pricing",
    body: "A recommended price from the model, its age, the hardware test score and your city's market. Sellers stop guessing and buyers stop haggling.",
    detail: "Model, age, test score, city",
  },
  {
    title: "Verified phones and sellers",
    body: "Sellers run a short in-app hardware test and we check the IMEI. Pass both and the listing earns a Verified Hardware badge. Every seller confirms their CNIC before posting.",
    detail: "IMEI check, hardware test, CNIC",
  },
  {
    title: "Escrow, or cash at the meetup",
    body: "Pay through escrow and the money is released only after you've inspected the phone. Prefer cash? Meet at a verified spot and keep it face to face.",
    detail: "Funds held until inspection",
  },
  {
    title: "Safe meetup spots",
    body: "We suggest public places that are convenient for both of you, such as malls and community centres, so the exchange happens somewhere safe.",
    detail: "Based on both locations",
  },
  {
    title: "Private chat and clear offers",
    body: "Phone numbers stay hidden. Offer templates keep negotiation specific, and the chat warns you when a message looks like a scam.",
    detail: "Number masking, fraud alerts",
  },
  {
    title: "Reviews from real deals",
    body: "Only people who closed a deal can review the other side, and they attach photos or video of the phone they received.",
    detail: "Closed deals only",
  },
];

/** `slug` is the card image in /public/brands (logo cards generated from the brands' own logos) */
export const brands: { name: string; slug: string; listings: string }[] = [
  { name: "Apple", slug: "apple", listings: "3,420" },
  { name: "Samsung", slug: "samsung", listings: "4,180" },
  { name: "Xiaomi", slug: "xiaomi", listings: "2,960" },
  { name: "Oppo", slug: "oppo", listings: "1,740" },
  { name: "Vivo", slug: "vivo", listings: "1,690" },
  { name: "Realme", slug: "realme", listings: "1,380" },
  { name: "Infinix", slug: "infinix", listings: "1,250" },
  { name: "Tecno", slug: "tecno", listings: "1,120" },
  { name: "Huawei", slug: "huawei", listings: "640" },
  { name: "Google Pixel", slug: "googlepixel", listings: "310" },
  { name: "OnePlus", slug: "oneplus", listings: "420" },
  { name: "Honor", slug: "honor", listings: "380" },
  { name: "Motorola", slug: "motorola", listings: "290" },
  { name: "Nokia", slug: "nokia", listings: "260" },
  { name: "Itel", slug: "itel", listings: "570" },
  { name: "Sony", slug: "sony", listings: "120" },
];

export type ReviewGroup = "buyer" | "seller" | "refurbisher";
export type EvidenceKind = "crack" | "back" | "box" | "video";

export const reviewGroups: { id: ReviewGroup | "all"; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "buyer", label: "Buyers" },
  { id: "seller", label: "Sellers" },
  { id: "refurbisher", label: "Refurbishers" },
];

export const reviews: {
  quote: string;
  name: string;
  role: string;
  city: string;
  group: ReviewGroup;
  rating: number;
  /** what the attached evidence shows (drawn as a placeholder illustration) */
  evidence: EvidenceKind;
  evidenceLabel: string;
}[] = [
  {
    quote:
      "The report said the screen had a crack in one corner, and it did. I paid a fair price for exactly what I saw, and the money only went to the seller after I'd checked it at the meetup.",
    name: "Areeba Siddiqui",
    role: "Student, bought a Galaxy A54",
    city: "Lahore",
    group: "buyer",
    rating: 5,
    evidence: "crack",
    evidenceLabel: "Photo attached",
  },
  {
    quote:
      "I sold my old phone in one afternoon. The suggested price was fair, and nobody argued about it.",
    name: "Hassan Raza",
    role: "Seller",
    city: "Karachi",
    group: "seller",
    rating: 5,
    evidence: "box",
    evidenceLabel: "Photo attached",
  },
  {
    quote:
      "I buy cracked phones, fix them and relist them. Running the test again after a repair updates the report, so buyers see what I actually did.",
    name: "Tariq Mehmood",
    role: "Independent technician",
    city: "Rawalpindi",
    group: "refurbisher",
    rating: 5,
    evidence: "video",
    evidenceLabel: "Video attached",
  },
  {
    quote:
      "The chat hid my number and flagged one buyer who asked me to move to another app. I didn't have to guess.",
    name: "Mahnoor Chaudhry",
    role: "Seller",
    city: "Islamabad",
    group: "seller",
    rating: 4,
    evidence: "back",
    evidenceLabel: "Photo attached",
  },
  {
    quote:
      "On other sites, I found the problems at the meetup. Here they were in the first lines of the listing.",
    name: "Usman Ghani",
    role: "Buyer, young professional",
    city: "Faisalabad",
    group: "buyer",
    rating: 5,
    evidence: "crack",
    evidenceLabel: "Photo attached",
  },
  {
    quote:
      "Buying in bulk used to mean trusting strangers. With the verified reports I can price a batch before I even leave the shop.",
    name: "Bilal Hussain",
    role: "Refurbisher",
    city: "Gujranwala",
    group: "refurbisher",
    rating: 4,
    evidence: "video",
    evidenceLabel: "Video attached",
  },
];

/** Sample figures for the rating summary (prototype data). */
export const ratingSummary = {
  average: 4.8,
  total: 12480,
  /** share of reviews per star, 5 down to 1, in percent */
  distribution: [82, 14, 3, 1, 0],
};

export const members = [
  "Muhammad Hamza Kashif",
  "Ahmed Ali",
  "Muhammad Ibraheem",
  "Ahmed Jalal",
];
