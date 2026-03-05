// src/lib/seo.ts
import type { Metadata } from "next";

export const SITE = {
  name: "The Pontville Pub",
  url: "https://www.pontvillepub.com",
  locale: "en_AU",
  phone: "+61 3 6268 1235",
  email: "pontvillepub@gmail.com",
  address: {
    locality: "Pontville",
    region: "TAS",
    postalCode: "7030",
    country: "AU",
  },
};

export function absUrl(path = "/") {
  return path.startsWith("http") ? path : `${SITE.url}${path}`;
}

export function baseMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE.url),
    applicationName: SITE.name,
    title: {
      default: `${SITE.name} | Historic Pub in Pontville, Tasmania`,
      template: `%s | ${SITE.name}`,
    },
    description:
      "Serving travellers since 1835. Enjoy classic pub favourites, events, and a relaxed dining experience in Pontville, Tasmania.",
    alternates: { canonical: "/" },
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
      url: SITE.url,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: "/og", width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og"],
    },
    icons: {
      icon: [{ url: "/favicon.ico" }],
      apple: [{ url: "/apple-touch-icon.png" }],
    },
  };
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string; // "/menu" etc
  image?: string; // "/og?..." etc
}): Metadata {
  const canonical = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  const ogImage = opts.image ?? "/og";

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical },
    openGraph: {
      title: `${opts.title} | ${SITE.name}`,
      description: opts.description,
      url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      title: `${opts.title} | ${SITE.name}`,
      description: opts.description,
      images: [ogImage],
    },
  };
}
