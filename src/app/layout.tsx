import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Big_Shoulders_Stencil, Recursive } from "next/font/google";
import "./globals.css";

// Stencil lettering for sheet titles; Recursive for everything else. Its CASL axis is the
// "pencil" (casual) to "ink" (linear) morph the cursor agents run when they finish an element.
const stencil = Big_Shoulders_Stencil({ subsets: ["latin"], variable: "--font-stencil", axes: ["opsz"] });
const recursive = Recursive({ subsets: ["latin"], variable: "--font-rec", axes: ["CASL", "MONO", "slnt"] });

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* apply a saved print (theme) before first paint so the diazo print does not flash cyanotype */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("print")==="diazo")document.documentElement.dataset.theme="diazo"}catch(e){}` }} />
      </head>
      <body className={cn("min-h-screen antialiased", stencil.variable, recursive.variable)}>
        {children}
      </body>
    </html>
  );
}
