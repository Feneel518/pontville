import PromoBanners from "@/components/dashboard/promotions/PromotionBanner";
import AboutSection from "@/components/frontend/home/AboutSection";
import HeroSection from "@/components/frontend/home/HeroSection";
import HowToBook from "@/components/frontend/home/HowToBook";
import OurInstagram from "@/components/frontend/home/OurInstagram";
import OurLocation from "@/components/frontend/home/OurLocation";
import OurMenu from "@/components/frontend/home/OurMenu";
import Testimonials from "@/components/frontend/home/Testimonials";
import { prisma } from "@/lib/prisma/db";

export default async function Home() {
  const restaurant = await prisma.restaurant.findFirst();
  const reviews = await prisma.review.findMany({
    where: { isFeatured: true },
    orderBy: [{ updatedAt: "desc" }],
    take: 10,
  });
  return (
    <main className="min-h-screen bg-background  font-sans">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl bg-red-700/20" />
        <div className="absolute top-40 right-[-120px] h-[420px] w-[420px] rounded-full blur-3xl bg-pink-600/20" />
        <div className="absolute bottom-40 left-[-140px] h-[520px] w-[520px] rounded-full blur-3xl bg-primary/20" />
      </div>
      <div className="h-svh -mt-16 md:-mt-20 ">
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
        insta1={restaurant?.insta1!}
        insta2={restaurant?.insta2!}
        insta3={restaurant?.insta3!}
        insta4={restaurant?.insta4!}></OurInstagram>
      <OurLocation
        address={`${restaurant?.addressLine}, ${restaurant?.city}, ${restaurant?.state}} - ${restaurant?.postcode}`}
        email={restaurant?.email!}
        hours={restaurant?.hoursJson}
        lat={restaurant?.mapLat!}
        lng={restaurant?.mapLng!}
        phone={restaurant?.phone!}></OurLocation>
    </main>
  );
}
