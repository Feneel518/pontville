import AboutSection from "@/components/frontend/home/AboutSection";
import HeroSection from "@/components/frontend/home/HeroSection";
import OurMenu from "@/components/frontend/home/OurMenu";
import { prisma } from "@/lib/prisma/db";

export default async function Home() {
  const restaurant = await prisma.restaurant.findFirst();
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
          tagLine={restaurant?.tagline}></HeroSection>
      </div>
      <AboutSection></AboutSection>
      <OurMenu></OurMenu>
      {/*
      <HowToBook></HowToBook>
      <Testimonials></Testimonials>
      <OurInstagram></OurInstagram>
      <OurLocation></OurLocation> */}
    </main>
  );
}
