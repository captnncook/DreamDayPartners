import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DreamDay Partners — Plan jullie trouwdag zonder stress",
    template: "%s | DreamDay Partners",
  },
  description: "Stel je dream team samen, regel offertes en facturen en maak je draaiboek — alles in één app. Gratis voor bruidsparen.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamdaypartners-production.up.railway.app"),
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "/",
    siteName: "DreamDay Partners",
    title: "DreamDay Partners — Plan jullie trouwdag zonder stress",
    description: "Stel je dream team samen, regel offertes en facturen en maak je draaiboek — alles in één app. Gratis voor bruidsparen.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "DreamDay Partners" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DreamDay Partners — Plan jullie trouwdag zonder stress",
    description: "Stel je dream team samen, regel offertes en facturen en maak je draaiboek — alles in één app.",
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${geist.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
