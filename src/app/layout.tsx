import type { Metadata } from "next";
import { Amarante, Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import "./globals.css";
import { CursorRouteReset } from "@/components/global/CursorUnmount";
import NextTopLoader from "nextjs-toploader";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const amarante = Amarante({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const siteUrl = "https://www.pontvillepub.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "The Pontville Pub",
  title: {
    default: "The Pontville Pub | Historic Pub in Pontville, Tasmania",
    template: "%s | The Pontville Pub",
  },
  description:
    "Serving travellers since 1835. Enjoy classic pub favourites, events, and a relaxed dining experience in Pontville, Tasmania.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "The Pontville Pub",
    title: "The Pontville Pub | Historic Pub in Pontville, Tasmania",
    description:
      "Serving travellers since 1835. Book a table, view the menu, and explore events at The Pontville Pub.",
    locale: "en_AU",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "The Pontville Pub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Pontville Pub",
    description:
      "Historic pub in Pontville, Tasmania. Menu, events, and table bookings.",
    images: ["/og"],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${amarante.variable} font-sans  antialiased flex flex-col min-h-svh`}>
        <CursorRouteReset />
        <NextTopLoader color="#f9786c;" showSpinner={false} height={3} />
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster richColors />
      </body>
    </html>
  );
}
