// app/about/page.tsx

import AboutHero from "@/components/frontend/about/AboutHero";
import OurAmbience from "@/components/frontend/about/OurAmbience";
import PentvilleGallery from "@/components/frontend/about/PentvilleGallery";
import WhoWeAre from "@/components/frontend/about/WhoWeAre";
import { pageMetadata } from "@/lib/helpers/seo";
import { CalendarDays, HeartHandshake, Users, Utensils } from "lucide-react";
import { Metadata } from "next";

const VALUES = [
  {
    title: "Genuine Hospitality",
    desc: "A warm welcome, friendly service, and the kind of place you’ll want to return to.",
    icon: HeartHandshake,
  },
  {
    title: "Wholesome Country Dining",
    desc: "Classic pub favourites, seasonal specials, and comfort food done right.",
    icon: Utensils,
  },
  {
    title: "A Place for Everyone",
    desc: "Families, locals, travellers—come as you are. Good vibes and good company.",
    icon: Users,
  },
  {
    title: "A Long, Proud Story",
    desc: "A local landmark since 1835 in historic Pontville—still here, still loved.",
    icon: CalendarDays,
  },
];

const GALLERY = [
  { src: "/about/gallery-1.jpg", alt: "Crown Inn dining area" },
  { src: "/about/gallery-2.jpg", alt: "Crown Inn bar atmosphere" },
  { src: "/about/gallery-3.jpg", alt: "Crown Inn food and drinks" },
  { src: "/about/gallery-4.jpg", alt: "Crown Inn outdoor / entrance" },
];

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Learn about The Pontville Pub — a historic Tasmanian pub serving travellers since 1835.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main>
      <div className="pointer-events-none fixed inset-0 opacity-70 -z-10">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl bg-red-700/20" />
        <div className="absolute top-40 right-[-120px] h-[420px] w-[420px] rounded-full blur-3xl bg-pink-600/20" />
        <div className="absolute bottom-40 left-[-140px] h-[520px] w-[520px] rounded-full blur-3xl bg-primary/20" />
      </div>
      <div className="h-svh -mt-16 md:-mt-20 ">
        <AboutHero></AboutHero>
      </div>
      <OurAmbience></OurAmbience>
      <WhoWeAre></WhoWeAre>
      <PentvilleGallery></PentvilleGallery>
    </main>
  );
}
