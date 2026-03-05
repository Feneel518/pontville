"use client";

import React, { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import ArrowButton from "@/components/ui/ArrowButton";
import { Review } from "@prisma/client";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface TestimonialsProps {
  reviews: Review[];
}

type Slide = {
  title: string;
  image: string;
};

const slides: Slide[] = [
  { title: "Main dishes", image: "/mainImage.jpg" },
  { title: "Salads", image: "/sideImage.jpg" },
  { title: "Desserts", image: "/mainImage.jpg" },
  { title: "Drinks", image: "/sideImage.jpg" },
  { title: "Kids", image: "/mainImage.jpg" },
  { title: "Specials", image: "/sideImage.jpg" },
];

function stars(n: number) {
  return "⭐".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
}

const Testimonials: FC<TestimonialsProps> = ({ reviews }) => {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [current, setCurrent] = React.useState(1);
  const [count, setCount] = React.useState(slides.length);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    api.on("reInit", () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const canPrev = api?.canScrollPrev() ?? false;
  const canNext = api?.canScrollNext() ?? false;
  return (
    <SectionComponent>
      <div className="flex items-end justify-between">
        <Heading label="Our Clients"></Heading>
        <div className="hidden items-center justify-end py-8 md:flex">
          <div className="" onClick={() => api?.scrollPrev()}>
            <ArrowButton
              direction="left"
              label="Prev"
              showLabel={false}></ArrowButton>
          </div>
          <div className="font-serif text-xl text-secondary-foreground">
            {String(current).padStart(2, "0")}/{String(count).padStart(2, "0")}
          </div>
          <div className="" onClick={() => api?.scrollNext()}>
            <ArrowButton
              direction="right"
              label="Next"
              showLabel={false}></ArrowButton>
          </div>
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full">
        <CarouselContent className="-ml-4">
          {reviews.map((s, idx) => (
            <CarouselItem
              key={idx}
              className="pl-4 basis-full rounded-sm md:basis-1/2 lg:basis-1/3 bg-primary/30">
              <div className="flex flex-col items-start p-6 gap-4">
                <div className="relative w-full h-60">
                  <Image
                    src={s.authorPhoto ?? "/placeholder.png"}
                    alt={s.authorName}
                    fill
                    className="object-cover"></Image>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="text-xl font-serif ">{s.authorName}</div>
                  <p>{stars(s.rating)}</p>
                </div>
                <div className="text-sm">{s.message}</div>
              </div>
              {/* <div className="group relative overflow-hidden rounded-2xl ring-1 ring-border">
                <div className="relative aspect-4/5 md:aspect-4/5 w-full">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-liner-to-t from-black/60 via-black/10 to-transparent" />
                </div>

                <div className="absolute bottom-4 left-4">
                  <p className="text-white/90">{s.title}</p>
                </div>
              </div> */}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className=" md:flex md:justify-end">
        <ArrowButton direction="right" label="Leave Feedback"></ArrowButton>
      </div>
    </SectionComponent>
  );
};

export default Testimonials;
