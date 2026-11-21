import type { Metadata, Viewport } from "next";
import { Anton, DM_Serif_Display, Poppins } from "next/font/google";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// H1 and section headings only.
const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Condensed accent for short uppercase labels and numbers only, never sentences.
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const DEFAULT_TITLE = "Sea Soul Sandadi — Sunday Flea Market by the Sea, Vizag";
// "flea market" and "Vizag" are what people actually search for; keep both in title and description.
const DESCRIPTION =
  "A once-a-month Sunday flea market by the sea at MGM Lawns, Beach Road, Vizag: local brands, slow food, live music, workshops, families and pets.";
const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "Aerial view of Sea Soul Sandadi: rows of white stalls beside the beach in Visakhapatnam",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s · Sea Soul Sandadi" },
  description: DESCRIPTION,
  applicationName: "Sea Soul Sandadi",
  category: "events",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Sea Soul Sandadi",
    title: DEFAULT_TITLE,
    description:
      "A local flea market, slow food, live acoustic music, workshops and pet-friendly spaces. Once a month, on a Sunday, by the sea in Visakhapatnam.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description:
      "A local flea market, slow food, live music and workshops by the sea in Vizag. Once a month, on a Sunday.",
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#ecdfc8",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: extensions (Grammarly, Liner…) add attributes to <html>/<body> before React hydrates.
    // It only covers these two elements' own attributes; mismatches inside the page are still reported.
    <html
      lang="en-IN"
      className={`${poppins.variable} ${dmSerif.variable} ${anton.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-surface text-ink font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
