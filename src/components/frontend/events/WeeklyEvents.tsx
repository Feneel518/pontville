"use client";
import { FC, useRef } from "react";

import Image from "next/image";

import { Music, Sparkles, Users, Utensils } from "lucide-react";
import useCursorStore from "@/hooks/useCursorStore";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import ArrowButton from "@/components/ui/ArrowButton";
import { PromoBanner } from "@prisma/client";
import { BookTableButton } from "@/components/global/BookTableButton";

interface WeeklyEventsProps {
  promos: PromoBanner[];
}

export const WEEKLY_EVENTS = [
  {
    title: "Live Music Fridays",
    subtitle: "From 7 PM • Local artists",
    // icon: Music,
    image: "/events/live-music.jpg",
  },
  {
    title: "Trivia Thursdays",
    subtitle: "From 6:30 PM • Prizes to win",
    // icon: Sparkles,
    image: "/events/trivia.jpg",
  },
  {
    title: "Midweek Dinner Specials",
    subtitle: "Wed–Thu • Seasonal menu offers",
    // icon: Utensils,
    image: "/events/dinner.jpg",
  },
  {
    title: "Sunday Sessions",
    subtitle: "Chill afternoon vibes • Family-friendly",
    // icon: Users,
    image: "/events/sunday.jpg",
  },
];

const WeeklyEvents: FC<WeeklyEventsProps> = ({ promos }) => {
  const ImageOneRef = useRef(null);
  const ImageTwoRef = useRef(null);
  const ImageThreeRef = useRef(null);
  const ImageFourRef = useRef(null);

  const setCursor = useCursorStore((s) => s.setCursor);
  const { label, type } = useCursorStore();

  const onPointerEnter = (index: number) => {
    setCursor({
      label: (
        <>
          <div className="space-y-1 flex items-center justify-center flex-col p-1">
            <p className="text-center">{promos[index].title}</p>
            <p className="text-sm text-wrap text-center ">
              {promos[index].message}
            </p>
          </div>
        </>
      ),
      type: "weekly",
    });
  };

  const onPointerLeave = () => setCursor({ label: null, type: "default" });
  return (
    <SectionComponent className="max-md:mb-20">
      <Heading label="Weekly Lineups"></Heading>
      <div className="grid md:grid-cols-4 gap-8 relative ">
        <div
          ref={ImageOneRef}
          onPointerEnter={() => onPointerEnter(0)}
          onPointerLeave={onPointerLeave}
          className="h-[350px] w-full  relative">
          <div className="absolute inset-0 flex items-center justify-center z-30 md:hidden">
            <div className="bg-primary/80! backdrop-blur-[2px] size-44 rounded-sm flex items-center justify-center     text-xl uppercase   text-white font-serif">
              <>
                <div className="space-y-1 flex items-center justify-center flex-col p-1">
                  <p className="text-center">{promos[0].title}</p>
                  <p className="text-sm text-wrap text-center ">
                    {promos[0].message}
                  </p>
                </div>
              </>
            </div>
          </div>
          <Image
            src={promos[0].imageUrl ?? "/placeholder.jpg"}
            alt="image"
            fill
            className="object-cover"></Image>
        </div>
        <div
          ref={ImageTwoRef}
          onPointerEnter={() => onPointerEnter(1)}
          onPointerLeave={onPointerLeave}
          className="h-[500px] max-md:h-[350px] w-full relative">
          <div className="absolute inset-0 flex items-center justify-center z-30 md:hidden">
            <div className="bg-primary/80! backdrop-blur-[2px] size-44 rounded-sm flex items-center justify-center     text-xl uppercase   text-white font-serif">
              <>
                <div className="space-y-1 flex items-center justify-center flex-col p-1">
                  <p className="text-center">{promos[1].title}</p>
                  <p className="text-sm text-wrap text-center ">
                    {promos[1].message}
                  </p>
                </div>
              </>
            </div>
          </div>
          <Image
            src={promos[1].imageUrl ?? "/placeholder.jpg"}
            alt="image"
            fill
            className="object-cover"></Image>
        </div>
        <div
          ref={ImageThreeRef}
          onPointerEnter={() => onPointerEnter(2)}
          onPointerLeave={onPointerLeave}
          className="h-[400px] max-md:h-[350px] w-full relative place-self-end">
          <div className="absolute inset-0 flex items-center justify-center z-30 md:hidden">
            <div className="bg-primary/80! backdrop-blur-[2px] size-44 rounded-sm flex items-center justify-center     text-xl uppercase   text-white font-serif">
              <>
                <div className="space-y-1 flex items-center justify-center flex-col p-1">
                  <p className="text-center">{promos[2].title}</p>
                  <p className="text-sm text-wrap text-center ">
                    {promos[2].message}
                  </p>
                </div>
              </>
            </div>
          </div>
          <Image
            src={promos[2].imageUrl ?? "/placeholder.jpg"}
            alt="image"
            fill
            className="object-cover"></Image>
        </div>
        <div
          ref={ImageFourRef}
          onPointerEnter={() => onPointerEnter(3)}
          onPointerLeave={onPointerLeave}
          className="h-[400px] max-md:h-[350px] w-full relative">
          <div className="absolute inset-0 flex items-center justify-center z-30 md:hidden">
            <div className="bg-primary/80! backdrop-blur-[2px] size-44 rounded-sm flex items-center justify-center     text-xl uppercase   text-white font-serif">
              <>
                <div className="space-y-1 flex items-center justify-center flex-col p-1">
                  <p className="text-center">{promos[3]?.title}</p>
                  <p className="text-sm text-wrap text-center ">
                    {promos[3]?.message}
                  </p>
                </div>
              </>
            </div>
          </div>
          <Image
            src={promos[3]?.imageUrl ?? "/placeholder.jpg"}
            alt="image"
            fill
            className="object-cover"></Image>
        </div>
        <div className="absolute md:right-0 bottom-0 max-md:-bottom-12">
          <BookTableButton
            type="EVENT"
            trigger={
              <div className="group flex cursor-pointer items-center z-40 gap-2 md:p-2 md:pl-0 ">
                <div
                  className={`relative h-4 w-[200px] shrink-0 inline-block translate-x-0 transition-transform duration-300 group-hover:-translate-x-2" `}>
                  <Image
                    src="/Arrow.svg"
                    alt="Arrow"
                    fill
                    className={`object-contain `}
                  />
                </div>
                <div
                  className={`h-4 flex items-center justify-center  translate-x-0 transition-transform duration-300 group-hover:translate-x-2}`}>
                  Group Booking
                </div>
              </div>
            }></BookTableButton>
        </div>
      </div>
    </SectionComponent>
  );
};

export default WeeklyEvents;
