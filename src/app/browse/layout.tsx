import ChatWidget from "@/components/chat/ChatWidget";

/** The floating chat lives in the layout so it stays open when moving between the list and a listing. */
export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ChatWidget lift />
    </>
  );
}
