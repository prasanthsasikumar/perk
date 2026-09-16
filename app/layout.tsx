import type { Metadata, Viewport } from "next";
import { Rethink_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const rethinkSans = Rethink_Sans({ variable: "--font-rethink-sans", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Perk: loyalty cards in your customers' wallets", template: "%s · Perk" },
  description: "Digital stamp cards for coffee shops, delivered to Apple Wallet and Google Wallet.",
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${rethinkSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
