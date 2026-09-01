import type { Metadata, Viewport } from "next";
import { Rethink_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const rethinkSans = Rethink_Sans({ variable: "--font-rethink-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Perk — loyalty cards in your customers' wallets", template: "%s · Perk" },
  description: "Digital stamp cards for coffee shops, delivered to Apple Wallet and Google Wallet.",
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${rethinkSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
