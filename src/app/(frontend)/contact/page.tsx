import ContactHero from "@/components/frontend/contact/ContactHero";
import OurInstagram from "@/components/frontend/home/OurInstagram";
import { pageMetadata, SITE } from "@/lib/helpers/seo";
import { prisma } from "@/lib/prisma/db";
import { Metadata } from "next";
import Script from "next/script";
import { FC } from "react";

interface pageProps {}

export const metadata: Metadata = pageMetadata({
  title: "Contact & Location",
  description:
    "Find The Pontville Pub in Pontville, Tasmania. Call, email, or visit us for bookings, events, and dining.",
  path: "/contact",
});

const page: FC<pageProps> = async ({}) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.name,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
  };
  const restaurant = await prisma.restaurant.findFirst({
    select: {
      insta1: true,
      insta2: true,
      insta3: true,
      insta4: true,
      instagramUrl: true,
      facebookUrl: true,
    },
  });
  return (
    <>
      <Script
        id="jsonld-contact"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-background  relative font-sans">
        {/* Background glow */}
        <div className="pointer-events-none fixed inset-0 opacity-70">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl bg-red-700/20" />
          <div className="absolute top-40 right-[-120px] h-[420px] w-[420px] rounded-full blur-3xl bg-pink-600/20" />
          <div className="absolute bottom-40 left-[-140px] h-[520px] w-[520px] rounded-full blur-3xl bg-primary/20" />
        </div>

        <ContactHero></ContactHero>
        <div className="pb-20">
          <OurInstagram
            instaLink={restaurant?.instagramUrl}
            facebookLink={restaurant?.facebookUrl}
            insta1={restaurant?.insta1!}
            insta2={restaurant?.insta2!}
            insta3={restaurant?.insta3!}
            insta4={restaurant?.insta4!}></OurInstagram>
        </div>
      </main>
    </>
  );
};

export default page;
