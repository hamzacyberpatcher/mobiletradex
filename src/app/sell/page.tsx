import type { Metadata } from "next";
import ListingFlow from "@/components/listing/ListingFlow";

export const metadata: Metadata = {
  title: "List your phone | MobileTradeX",
  description: "Verify your CNIC, describe your phone, run the hardware test and get a fair price suggestion.",
};

export default function SellPage() {
  return <ListingFlow />;
}
