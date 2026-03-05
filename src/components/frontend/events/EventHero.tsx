"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { CalendarDays, MapPin } from "lucide-react";
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import ArrowButton from "@/components/ui/ArrowButton";

interface EventHeroProps {}

const EventHero: FC<EventHeroProps> = ({}) => {
  return (
    <section className="relative grid min-h-svh h-screen md:grid-cols-2">
      {/* Left: Main image */}
      <div className="relative min-h-svh w-full md:h-screen">
        <Image
          src="/mainImage.jpg"
          alt="Hero Image"
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="absolute inset-0 z-30 bg- flex items-center justify-center md:hidden ">
        <div className="bg-background/60 backdrop-blur-[2px] mx-4 absolute p-6 rounded-sm">
          <div className="flex flex-wrap items-center gap-2 z-30">
            <Badge variant="secondary" className="gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              What’s On
            </Badge>
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Pontville, Tasmania
            </Badge>
          </div>

          <h2
            className={cn(
              "font-serif uppercase text-[clamp(40px,8vw,100px)] leading-[100px]",
            )}>
            Events at Pontville
          </h2>
          <p className=" max-w-md text-base leading-7 md:text-muted-foreground">
            Live music, trivia, seasonal specials, and relaxed sessions—made for
            good company and great nights.
          </p>

          <div className="mt-12 flex flex-wrap gap-3">
            <ArrowButton direction="right" label="Reserve Now"></ArrowButton>
          </div>
        </div>
      </div>

      <div className="grid grid-rows-2 p-20">
        <div className="w-full h-full">
          <div className="absolute right-6 top-24 w-[260px] aspect-5/3 md:right-20 md:top-32 md:w-[450px] max-md:hidden">
            <Image
              src="/sideImage.jpg"
              alt="side Image"
              fill
              sizes="(min-width: 768px) 450px, 0px"
              className="object-cover rounded-sm"
            />
          </div>
        </div>
        <div className="flex  flex-col justify-end max-md:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              What’s On
            </Badge>
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Pontville, Tasmania
            </Badge>
          </div>

          <h2
            className={cn(
              "font-serif uppercase text-[clamp(40px,8vw,100px)] leading-[100px]",
            )}>
            Events at Pontville
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
            Live music, trivia, seasonal specials, and relaxed sessions—made for
            good company and great nights.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <ArrowButton direction="right" label="Reserve Now"></ArrowButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventHero;
