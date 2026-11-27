/**
 * Seed conversations for the prototype /chat page. Each one is about a real
 * listing from data/listings.ts, so the phone, seller and price match what a
 * buyer saw on /browse. Replies are canned in ChatApp; nothing is sent anywhere.
 */
import { listingById, listings, type Listing } from "@/data/listings";
import { ptaOptions } from "@/data/listing";

export type OfferStatus = "pending" | "accepted" | "declined";

export type Message = { id: string; time: string } & (
  | { from: "me" | "them"; kind: "text"; text: string }
  | { from: "me" | "them"; kind: "offer"; amount: number; payment: "escrow" | "cod"; status: OfferStatus }
  | { from: "system"; kind: "alert" | "event"; text: string }
);

export type Conversation = {
  id: string;
  unread: number;
  listingId: string;
  seller: { name: string; city: string; deals: number; rating: number; cnic: boolean };
  phone: { brand: string; title: string; spec: string; grade: string; verified: boolean; price: number; status: "available" | "reserved" | "sold" };
  messages: Message[];
};

function about(id: string): Pick<Conversation, "listingId" | "seller" | "phone"> {
  const l = listingById(id) as Listing;
  const pta = ptaOptions.find((p) => p.value === l.pta)?.label ?? "";
  return {
    listingId: l.id,
    seller: { name: l.seller.name, city: l.seller.city, deals: l.seller.deals, rating: l.seller.rating, cnic: true },
    phone: {
      brand: l.brand,
      title: l.title,
      spec: `${l.storage}, ${l.ram} RAM, ${pta}`,
      grade: l.grade,
      verified: l.tested,
      price: l.price,
      status: l.status,
    },
  };
}

const safety: Message = {
  id: "sys",
  from: "system",
  kind: "event",
  text: "Your phone number is hidden in this chat. Payments made outside MobileTradeX are not protected.",
  time: "",
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    unread: 2,
    ...about("2401"),
    messages: [
      { ...safety, id: "c1s" },
      { id: "c1a", from: "me", kind: "text", text: "Is it still available?", time: "10:12 am" },
      { id: "c1b", from: "them", kind: "text", text: "Yes, it is. I can meet at Emporium Mall on weekday evenings.", time: "10:20 am" },
      { id: "c1c", from: "me", kind: "text", text: "Can you share the hardware report?", time: "10:24 am" },
      { id: "c1d", from: "them", kind: "text", text: "It is on the listing page. Every test passed. Battery health is 89%.", time: "10:31 am" },
      { id: "c1e", from: "them", kind: "offer", amount: 108000, payment: "escrow", status: "pending", time: "10:44 am" },
      { id: "c1f", from: "them", kind: "text", text: "That is the lowest I can go with escrow. Let me know.", time: "10:45 am" },
    ],
  },
  {
    id: "c2",
    unread: 1,
    ...about("2404"),
    messages: [
      { ...safety, id: "c2s" },
      { id: "c2a", from: "me", kind: "text", text: "Is the replaced screen an original Apple part?", time: "Yesterday" },
      { id: "c2b", from: "them", kind: "text", text: "It is a high-quality replacement from Hafeez Centre. True Tone does not work, everything else does.", time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    unread: 0,
    ...about("2402"),
    messages: [
      { ...safety, id: "c3s" },
      { id: "c3a", from: "me", kind: "offer", amount: 190000, payment: "escrow", status: "declined", time: "Mon" },
      { id: "c3b", from: "them", kind: "text", text: "Thank you, but the price is firm. It is still in perfect condition with the original box.", time: "Mon" },
    ],
  },
  {
    id: "c4",
    unread: 0,
    ...about(listings.find((l) => l.status === "sold")!.id),
    messages: [
      { ...safety, id: "c4s" },
      { id: "c4a", from: "me", kind: "text", text: "Is it still available?", time: "Last week" },
      { id: "c4b", from: "them", kind: "text", text: "Sorry, it was sold on Friday.", time: "Last week" },
    ],
  },
];
