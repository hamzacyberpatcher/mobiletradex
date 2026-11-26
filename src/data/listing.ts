/** Hard-coded data behind the listing flow (/sell). No backend: prices and models are samples. */

export type PhoneModel = {
  name: string;
  /** typical used price in Rs: PTA approved, good condition, mid storage tier, under a year old */
  base: number;
  storage: string[];
  ram: string[];
};

/** `slug` matches `brands` in content.ts and public/brands/<slug>.svg */
export const phoneBrands: { slug: string; name: string; models: PhoneModel[] }[] = [
  {
    slug: "apple",
    name: "Apple",
    models: [
      { name: "iPhone 11", base: 58000, storage: ["64 GB", "128 GB", "256 GB"], ram: ["4 GB"] },
      { name: "iPhone 12", base: 82000, storage: ["64 GB", "128 GB", "256 GB"], ram: ["4 GB"] },
      { name: "iPhone 13", base: 112000, storage: ["128 GB", "256 GB", "512 GB"], ram: ["4 GB"] },
      { name: "iPhone 14", base: 150000, storage: ["128 GB", "256 GB", "512 GB"], ram: ["6 GB"] },
      { name: "iPhone 14 Pro", base: 205000, storage: ["128 GB", "256 GB", "512 GB", "1 TB"], ram: ["6 GB"] },
    ],
  },
  {
    slug: "samsung",
    name: "Samsung",
    models: [
      { name: "Galaxy A14", base: 30000, storage: ["64 GB", "128 GB"], ram: ["4 GB"] },
      { name: "Galaxy A54", base: 68000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
      { name: "Galaxy S21", base: 60000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
      { name: "Galaxy S22 Ultra", base: 115000, storage: ["256 GB", "512 GB"], ram: ["12 GB"] },
      { name: "Galaxy S23", base: 110000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
    ],
  },
  {
    slug: "xiaomi",
    name: "Xiaomi",
    models: [
      { name: "Redmi Note 11", base: 28000, storage: ["64 GB", "128 GB"], ram: ["4 GB", "6 GB"] },
      { name: "Redmi Note 12", base: 38000, storage: ["128 GB", "256 GB"], ram: ["6 GB", "8 GB"] },
      { name: "Redmi Note 13 Pro", base: 62000, storage: ["128 GB", "256 GB", "512 GB"], ram: ["8 GB", "12 GB"] },
      { name: "Poco X5 Pro", base: 52000, storage: ["128 GB", "256 GB"], ram: ["6 GB", "8 GB"] },
    ],
  },
  {
    slug: "oppo",
    name: "Oppo",
    models: [
      { name: "A57", base: 26000, storage: ["64 GB", "128 GB"], ram: ["4 GB"] },
      { name: "Reno 8", base: 55000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
      { name: "Reno 10", base: 72000, storage: ["256 GB"], ram: ["8 GB"] },
    ],
  },
  {
    slug: "vivo",
    name: "Vivo",
    models: [
      { name: "Y20", base: 20000, storage: ["64 GB", "128 GB"], ram: ["4 GB"] },
      { name: "Y36", base: 38000, storage: ["128 GB"], ram: ["8 GB"] },
      { name: "V25", base: 48000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
    ],
  },
  {
    slug: "realme",
    name: "Realme",
    models: [
      { name: "Narzo 50", base: 22000, storage: ["64 GB", "128 GB"], ram: ["4 GB"] },
      { name: "C55", base: 30000, storage: ["64 GB", "128 GB", "256 GB"], ram: ["4 GB", "6 GB", "8 GB"] },
      { name: "11 Pro", base: 65000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
    ],
  },
  {
    slug: "infinix",
    name: "Infinix",
    models: [
      { name: "Hot 30", base: 24000, storage: ["64 GB", "128 GB"], ram: ["4 GB", "8 GB"] },
      { name: "Note 30", base: 32000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
      { name: "Zero 30", base: 48000, storage: ["256 GB"], ram: ["8 GB", "12 GB"] },
    ],
  },
  {
    slug: "tecno",
    name: "Tecno",
    models: [
      { name: "Spark 10 Pro", base: 28000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
      { name: "Camon 20", base: 42000, storage: ["256 GB"], ram: ["8 GB"] },
      { name: "Phantom X2", base: 85000, storage: ["256 GB"], ram: ["12 GB"] },
    ],
  },
  {
    slug: "googlepixel",
    name: "Google Pixel",
    models: [
      { name: "Pixel 6", base: 75000, storage: ["128 GB"], ram: ["8 GB"] },
      { name: "Pixel 7", base: 98000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
    ],
  },
  {
    slug: "oneplus",
    name: "OnePlus",
    models: [
      { name: "9", base: 72000, storage: ["128 GB", "256 GB"], ram: ["8 GB", "12 GB"] },
      { name: "10 Pro", base: 108000, storage: ["128 GB", "256 GB"], ram: ["8 GB", "12 GB"] },
    ],
  },
  {
    slug: "huawei",
    name: "Huawei",
    models: [
      { name: "P30 Pro", base: 48000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
      { name: "Nova 9", base: 45000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
      { name: "Nova Y70", base: 30000, storage: ["64 GB", "128 GB"], ram: ["4 GB", "6 GB"] },
    ],
  },
  {
    slug: "honor",
    name: "Honor",
    models: [
      { name: "X7", base: 27000, storage: ["128 GB"], ram: ["4 GB"] },
      { name: "X8", base: 36000, storage: ["128 GB"], ram: ["6 GB", "8 GB"] },
      { name: "90", base: 85000, storage: ["256 GB", "512 GB"], ram: ["8 GB", "12 GB"] },
    ],
  },
  {
    slug: "motorola",
    name: "Motorola",
    models: [
      { name: "Moto G32", base: 24000, storage: ["64 GB", "128 GB"], ram: ["4 GB", "6 GB"] },
      { name: "Moto G54", base: 42000, storage: ["128 GB", "256 GB"], ram: ["8 GB", "12 GB"] },
      { name: "Edge 30", base: 55000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
    ],
  },
  {
    slug: "nokia",
    name: "Nokia",
    models: [
      { name: "G21", base: 18000, storage: ["64 GB", "128 GB"], ram: ["4 GB"] },
      { name: "G42 5G", base: 32000, storage: ["128 GB"], ram: ["4 GB", "6 GB"] },
    ],
  },
  {
    slug: "itel",
    name: "Itel",
    models: [
      { name: "A60s", base: 14000, storage: ["64 GB", "128 GB"], ram: ["4 GB"] },
      { name: "P40", base: 16000, storage: ["128 GB"], ram: ["4 GB"] },
      { name: "S23", base: 22000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
    ],
  },
  {
    slug: "sony",
    name: "Sony",
    models: [
      { name: "Xperia 10 III", base: 40000, storage: ["128 GB"], ram: ["6 GB"] },
      { name: "Xperia 5 II", base: 65000, storage: ["128 GB", "256 GB"], ram: ["8 GB"] },
      { name: "Xperia 1 III", base: 90000, storage: ["256 GB", "512 GB"], ram: ["12 GB"] },
    ],
  },
];

/** Offered when the seller's model is not in the list above. */
export const genericStorage = ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];
export const genericRam = ["2 GB", "3 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB"];

export const colors = ["Black", "White", "Silver", "Blue", "Green", "Gold", "Purple", "Red", "Other"];

export const ptaOptions = [
  { value: "approved", label: "PTA approved", hint: "Registered with PTA, works on every network" },
  { value: "jv", label: "JV / factory unlocked", hint: "Works on local SIMs, not registered" },
  { value: "non-pta", label: "Non-PTA", hint: "Blocks after the temporary period" },
];

export const ageOptions = [
  { value: "lt6", label: "Under 6 months" },
  { value: "6to12", label: "6 to 12 months" },
  { value: "1to2", label: "1 to 2 years" },
  { value: "2to3", label: "2 to 3 years" },
  { value: "3plus", label: "More than 3 years" },
];

export const accessoryOptions = [
  { value: "box", label: "Original box" },
  { value: "charger", label: "Original charger" },
  { value: "receipt", label: "Purchase receipt" },
  { value: "case", label: "Case or cover" },
];

export const screenOptions = [
  { value: "flawless", label: "Flawless", hint: "No marks when the screen is on" },
  { value: "scratched", label: "Light scratches", hint: "Visible in light, not when on" },
  { value: "cracked", label: "Cracked or chipped", hint: "Glass is broken in any place" },
];

export const bodyOptions = [
  { value: "mint", label: "Like new", hint: "No marks on frame or back" },
  { value: "minor", label: "Minor marks", hint: "Small scuffs or paint wear" },
  { value: "dents", label: "Dents or bent frame", hint: "Visible damage to the body" },
];

export const panelOptions = [
  { value: "original", label: "All original parts", hint: "Never opened or repaired" },
  { value: "replaced", label: "Screen or panel replaced", hint: "Buyers will see this first" },
];

/** Things that may not work. `test` is the hardware-test row that confirms it. */
export const issueOptions = [
  { value: "faceid", label: "Face ID or fingerprint", test: "cameras" },
  { value: "camera", label: "Camera", test: "cameras" },
  { value: "speaker", label: "Speaker or microphone", test: "audio" },
  { value: "charging", label: "Charging port", test: "battery" },
  { value: "wifi", label: "Wi-Fi or SIM signal", test: "radio" },
  { value: "buttons", label: "Buttons or sensors", test: "radio" },
];

export const photoSlots = [
  { id: "front", label: "Front, screen off", required: true },
  { id: "back", label: "Back", required: true },
  { id: "screenOn", label: "Front, screen on", required: true },
  { id: "sides", label: "Sides and corners", required: true },
  { id: "imei", label: "IMEI screen (*#06#)", required: false },
  { id: "extras", label: "Box and accessories", required: false },
];

export const paymentOptions = [
  { value: "escrow", label: "Escrow", hint: "Buyer pays MobileTradeX, you are paid once they confirm the phone" },
  { value: "cod", label: "Cash at meetup", hint: "Buyer pays you in person after inspecting" },
  { value: "both", label: "Either", hint: "Let the buyer choose" },
];

export type Box = { north: number; south: number; east: number; west: number };

/** `box` is the rough outline of the city; meetup search is limited to it when Google Places is on. */
export const cities: { name: string; zones: string[]; box: Box }[] = [
  { name: "Lahore", zones: ["Emporium Mall, Johar Town", "Packages Mall, Walton Road"], box: { north: 31.68, south: 31.3, east: 74.58, west: 74.1 } },
  { name: "Karachi", zones: ["Dolmen Mall, Clifton", "Lucky One Mall, Rashid Minhas Road"], box: { north: 25.2, south: 24.72, east: 67.45, west: 66.8 } },
  { name: "Islamabad", zones: ["Centaurus Mall, F-8", "Safa Gold Mall, F-7"], box: { north: 33.85, south: 33.45, east: 73.3, west: 72.75 } },
  { name: "Faisalabad", zones: ["Lyallpur Galleria, Canal Road"], box: { north: 31.6, south: 31.3, east: 73.3, west: 72.95 } },
  { name: "Multan", zones: ["Mall of Multan, Abdali Road"], box: { north: 30.3, south: 30.1, east: 71.65, west: 71.35 } },
];

/** Used to check a typed city when Google Places is off. */
export const pkCities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Hyderabad", "Gujranwala",
  "Sialkot", "Sargodha", "Bahawalpur", "Sukkur", "Larkana", "Sheikhupura", "Rahim Yar Khan", "Jhang", "Gujrat", "Mardan",
  "Kasur", "Mingora", "Dera Ghazi Khan", "Nawabshah", "Sahiwal", "Okara", "Wah Cantonment", "Mirpur Khas", "Chiniot",
  "Abbottabad", "Mirpur", "Muzaffarabad", "Gilgit", "Skardu", "Jhelum", "Attock", "Murree", "Mansehra", "Kohat", "Bannu",
  "Gwadar", "Turbat", "Khuzdar", "Sadiqabad", "Kamoke", "Burewala", "Jacobabad", "Hafizabad", "Mandi Bahauddin", "Narowal",
  "Vehari", "Khanewal", "Chakwal", "Daska", "Gojra", "Muridke", "Kotli", "Haripur", "Nowshera", "Charsadda", "Swabi", "Dadu",
  "Shikarpur", "Khairpur", "Bhakkar", "Layyah", "Lodhran", "Pakpattan", "Toba Tek Singh", "Mianwali", "Taxila", "Rawalakot",
  "Chitral", "Hunza", "Zhob", "Loralai", "Sibi", "Kharian", "Wazirabad", "Ahmedpur East", "Kotri", "Jaranwala",
];

export const STEPS = [
  { id: "identity", label: "Identity", title: "Verify your identity", lead: "Every seller confirms their CNIC before posting. It keeps listings honest, and buyers never see the number." },
  { id: "device", label: "Device", title: "Tell us about your phone", lead: "Pick the exact model and enter the IMEI. Buyers see these details first." },
  { id: "condition", label: "Condition", title: "Describe its condition", lead: "Be specific. Listings that state defects clearly sell faster and are never disputed at the meetup." },
  { id: "test", label: "Hardware test", title: "Run the hardware test", lead: "A short check of the screen, audio, cameras, battery and IMEI earns the Verified Hardware badge." },
  { id: "photos", label: "Photos", title: "Add photos", lead: "Show the phone as it is today. Clear photos of damage protect you and the buyer." },
  { id: "price", label: "Price", title: "Set your price", lead: "We suggest a fair range from the model, condition, age and this week's local sales." },
  { id: "review", label: "Review", title: "Review and publish", lead: "This is exactly what buyers will see. Check each section, then publish." },
] as const;
