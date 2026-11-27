import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailView from "@/components/browse/DetailView";
import { listingById, listings } from "@/data/listings";
import { rs } from "@/lib/listing";

type Params = { params: Promise<{ id: string }> };

export const generateStaticParams = () => listings.map((l) => ({ id: l.id }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const l = listingById((await params).id);
  if (!l) return { title: "Phone not found | MobileTradeX" };
  return {
    title: `${l.title} ${l.storage} for ${rs(l.price)} | MobileTradeX`,
    description: `${l.grade} condition, battery ${l.battery}%, ${l.city}. ${l.defects.length ? l.defects[0] : "No defects reported"}.`,
  };
}

export default async function ListingPage({ params }: Params) {
  const l = listingById((await params).id);
  if (!l) notFound();
  return <DetailView id={l.id} />;
}
