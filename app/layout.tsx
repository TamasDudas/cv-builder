import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CV Builder",
  description: "Készítsd el önéletrajzod egyszerűen és gyorsan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: böngészőbővítmények (pl. jelszókezelő, fordító)
    // extra attribútumokat adhatnak a <html> taghez, amit React hydration
    // mismatch-ként érzékelne — ezzel elnyomjuk ezt a false positive warningot
    <html
      lang="hu"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: bővítmények (pl. jelszókezelő, DevTools)
          a <body> taghez is adhatnak attribútumokat induláskor */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        {/* Sonner toast értesítők — az egész alkalmazásban elérhetők */}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
