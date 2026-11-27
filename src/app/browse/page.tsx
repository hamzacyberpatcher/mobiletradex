import type { Metadata } from "next";
import BrowseApp from "@/components/browse/BrowseApp";

export const metadata: Metadata = {
  title: "Browse phones | MobileTradeX",
  description: "Search verified second-hand phones with their condition, defects and hardware report shown first.",
};

export default function BrowsePage() {
  return <BrowseApp />;
}
