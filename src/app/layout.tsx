import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Anton, Caveat, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  // `url` is blank until configured, and new URL("") throws.
  ...(DATA.url ? { metadataBase: new URL(DATA.url) } : {}),
  title: { default: DATA.name, template: `%s | ${DATA.name}` },
  description: DATA.description,
  openGraph: {
    title: DATA.name,
    description: DATA.description,
    url: DATA.url,
    siteName: DATA.name,
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
  twitter: { title: DATA.name, card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn("min-h-screen antialiased", anton.variable, caveat.variable, geist.variable, geistMono.variable)}>
        {children}
      </body>
    </html>
  );
}
