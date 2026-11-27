import type { Metadata } from "next";
import ChatApp from "@/components/chat/ChatApp";

export const metadata: Metadata = {
  title: "Messages | MobileTradeX",
  description: "Chat with sellers, make offers and start escrow without sharing your phone number.",
};

export default function ChatPage() {
  return <ChatApp />;
}
