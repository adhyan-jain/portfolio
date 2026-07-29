import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { config, isBlank } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const { meta, profile } = config;

const title = !isBlank(meta?.title)
  ? meta.title
  : !isBlank(profile?.name)
    ? [profile.name, profile.headline].filter((v) => !isBlank(v)).join(" — ")
    : "Portfolio";

const favicon = isBlank(meta?.faviconEmoji)
  ? undefined
  : `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="52" font-size="52">${meta.faviconEmoji}</text></svg>`,
    )}`;

export const metadata: Metadata = {
  title,
  description: isBlank(meta?.description) ? undefined : meta.description,
  ...(isBlank(meta?.siteUrl) ? {} : { metadataBase: new URL(meta.siteUrl) }),
  ...(favicon ? { icons: { icon: favicon } } : {}),
  openGraph: {
    title,
    description: isBlank(meta?.description) ? undefined : meta.description,
    type: "website",
    ...(isBlank(meta?.ogImage) ? {} : { images: [meta.ogImage] }),
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#08090a" },
  ],
};

/*
 * Applies the stored theme before first paint so a dark-mode visitor never sees
 * a white flash. Has to be inline and blocking for that to work.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
