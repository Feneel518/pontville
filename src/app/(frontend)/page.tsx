import PromoBanners from "@/components/dashboard/promotions/PromotionBanner";
import AboutSection from "@/components/frontend/home/AboutSection";
import HeroSection from "@/components/frontend/home/HeroSection";
import HowToBook from "@/components/frontend/home/HowToBook";
import OurInstagram from "@/components/frontend/home/OurInstagram";
import OurLocation from "@/components/frontend/home/OurLocation";
import OurMenu from "@/components/frontend/home/OurMenu";
import Testimonials from "@/components/frontend/home/Testimonials";
import { pageMetadata } from "@/lib/helpers/seo";
import { prisma } from "@/lib/prisma/db";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = pageMetadata({
  title: "Restaurant",
  description:
    "Serving travellers since 1835. Book a table, view the menu, and explore events at The Pontville Pub in Pontville, Tasmania.",
  path: "/",
});
export default async function Home() {
  const siteUrl = "https://www.pontvillepub.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "BarOrPub"],
    name: "The Pontville Pub",
    url: siteUrl,
    image: `${siteUrl}/og`,
    email: "pontvillepub@gmail.com",
    telephone: "+61 3 6268 1235",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pontville",
      addressRegion: "TAS",
      postalCode: "7030",
      addressCountry: "AU",
    },
    foundingDate: "1835",
    servesCuisine: ["Pub Food", "Australian"],
    priceRange: "$$",
    sameAs: [
      "https://www.instagram.com/", // replace with your exact profile
      "https://www.facebook.com/", // replace with your exact page
    ],
  };
  const restaurant = await prisma.restaurant.findFirst();
  const reviews = await prisma.review.findMany({
    where: { isFeatured: true },
    orderBy: [{ updatedAt: "desc" }],
    take: 10,
  });
  return (
    <>
      <Script
        id="jsonld-pontvillepub"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-background  font-sans">
        {/* Background glow */}
        <div className="pointer-events-none fixed inset-0 opacity-70">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl bg-red-700/20" />
          <div className="absolute top-40 right-[-120px] h-[420px] w-[420px] rounded-full blur-3xl bg-pink-600/20" />
          <div className="absolute bottom-40 left-[-140px] h-[520px] w-[520px] rounded-full blur-3xl bg-primary/20" />
        </div>
        <div className="h-svh -mt-20   md:-mt-20 ">
          <HeroSection
            restaurantName={restaurant?.name}
            logoUrl={restaurant?.logoUrl}
            tagLine={restaurant?.tagline}
            mainImage={restaurant?.homepageMainImage}
            sideImage={restaurant?.homepageSideImage}></HeroSection>
        </div>
        <AboutSection></AboutSection>
        <PromoBanners placement="HOME" limit={2} />
        <OurMenu></OurMenu>
        <HowToBook tabelImage={restaurant?.homePageBookATableImage}></HowToBook>
        {reviews.length > 0 && <Testimonials reviews={reviews}></Testimonials>}
        <OurInstagram
          instaLink={restaurant?.instagramUrl}
          facebookLink={restaurant?.facebookUrl}
          insta1={restaurant?.insta1!}
          insta2={restaurant?.insta2!}
          insta3={restaurant?.insta3!}
          insta4={restaurant?.insta4!}></OurInstagram>
        <OurLocation
          address={`${restaurant?.addressLine}, ${restaurant?.city}, ${restaurant?.state} - ${restaurant?.postcode}`}
          email={restaurant?.email!}
          hours={restaurant?.hoursJson}
          lat={restaurant?.mapLat!}
          lng={restaurant?.mapLng!}
          phone={restaurant?.phone!}></OurLocation>
      </main>
    </>
  );
}
