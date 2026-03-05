"use client";

import ArrowButton from "@/components/ui/ArrowButton";
import useCursorStore from "@/hooks/useCursorStore";
import Image from "next/image";

import { FC, useEffect, useRef } from "react";

interface HeroSectionProps {
  restaurantName: string | undefined;
  logoUrl: string | null | undefined;
  tagLine: string | undefined | null;
  mainImage: string | undefined | null;
  sideImage: string | undefined | null;
  
}

const HeroSection: FC<HeroSectionProps> = ({
  logoUrl,
  restaurantName,
  tagLine,
  mainImage,
  sideImage,

}) => {
  const mainTextRef = useRef(null);
  useEffect(() => {
    let locomotiveScroll: any;
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      locomotiveScroll = new LocomotiveScroll({});
    })();
  });

  const setCursor = useCursorStore((s) => s.setCursor);
  const { label, type } = useCursorStore();

  const onPointerEnter = () => {
    setCursor({
      label: (
        <Image
          src={logoUrl ? logoUrl : "/placeholder.png"}
          alt="logo"
          fill
          className="object-cover"></Image>
      ),
      type: "hover",
    });
  };

  const onPointerLeave = () => setCursor({ label: null, type: "default" });
  return (
    <section className="relative grid min-h-svh md:grid-cols-2">
      {/* Left: Main image */}
      <div className="relative min-h-svh w-full md:min-h-full">
        <Image
          src={mainImage ?? "mainImage.jpg"}
          alt="Hero Image"
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {/* Right: Side image + button (desktop only) */}
      <div className="relative hidden w-full p-6 md:block md:p-20">
        <div className="absolute right-6 top-24 w-[260px] aspect-5/3 md:right-20 md:top-32 md:w-[450px] rounded-sm">
          <Image
            src={sideImage ?? "sideImage.jpg"}
            alt="side Image"
            fill
            sizes="(min-width: 768px) 450px, 0px"
            className="object-cover rounded-sm"
          />
        </div>
        <div className="flex h-full items-end justify-end gap-4">
          <ArrowButton href="/menu" direction="right" label="View Menu" />
        </div>
      </div>

      {/* Overlay: Title content */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 ">
        <div className="pointer-events-auto flex flex-col items-start md:items-start">
          <p className="font-sans text-base md:text-2xl  ">{tagLine}</p>

          <h1
            ref={mainTextRef}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            className="font-serif leading-none  text-[clamp(60px,12vw,200px)] text-nowrap">
            {restaurantName}
          </h1>

          {/* Mobile button (only on small screens) */}
          <div className="mt-4 flex w-full justify-end md:hidden">
            <ArrowButton direction="right" href="/menu" label="View Menu" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
