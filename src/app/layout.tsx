import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MobileTradeX | Verified second-hand phones",
  description:
    "Buy and sell second-hand phones with hardware tests, IMEI checks, CNIC-verified sellers and escrow payment.",
};

export const viewport: Viewport = {
  themeColor: "#E6EBE8",
};

/**
 * Runs before first paint so there is no flash of the wrong theme. Order:
 * saved choice in localStorage, then the saved cookie, then the system setting.
 * Key name must match THEME_KEY in components/ThemeProvider.tsx.
 */
const themeScript = `(function(){try{var k="mtx-theme",t=null;try{t=localStorage.getItem(k)}catch(e){}if(t!=="light"&&t!=="dark"){var m=document.cookie.match(/(?:^|; )mtx-theme=(light|dark)/);t=m?m[1]:null}if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.style.colorScheme=t}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-frost font-sans text-ink antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
