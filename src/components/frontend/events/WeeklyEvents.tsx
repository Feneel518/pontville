"use client";
import { FC, useRef } from "react";

import Image from "next/image";

import { Music, Sparkles, Users, Utensils } from "lucide-react";
import useCursorStore from "@/hooks/useCursorStore";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import ArrowButton from "@/components/ui/ArrowButton";

interface WeeklyEventsProps {}

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

const WeeklyEvents: FC<WeeklyEventsProps> = ({}) => {
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
            <p className="text-center">{WEEKLY_EVENTS[index].title}</p>
            <p className="text-sm text-wrap text-center ">
              {WEEKLY_EVENTS[index].subtitle}
            </p>
          </div>
        </>
      ),
      type: "weekly",
    });
  };

  const onPointerLeave = () => setCursor({ label: null, type: "default" });
  return (
    <SectionComponent>
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
                  <p className="text-center">{WEEKLY_EVENTS[0].title}</p>
                  <p className="text-sm text-wrap text-center ">
                    {WEEKLY_EVENTS[0].subtitle}
                  </p>
                </div>
              </>
            </div>
          </div>
          <Image
            src={"/sideImage.jpg"}
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
                  <p className="text-center">{WEEKLY_EVENTS[1].title}</p>
                  <p className="text-sm text-wrap text-center ">
                    {WEEKLY_EVENTS[1].subtitle}
                  </p>
                </div>
              </>
            </div>
          </div>
          <Image
            src={"/sideImage.jpg"}
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
                  <p className="text-center">{WEEKLY_EVENTS[2].title}</p>
                  <p className="text-sm text-wrap text-center ">
                    {WEEKLY_EVENTS[2].subtitle}
                  </p>
                </div>
              </>
            </div>
          </div>
          <Image
            src={"/sideImage.jpg"}
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
                  <p className="text-center">{WEEKLY_EVENTS[3].title}</p>
                  <p className="text-sm text-wrap text-center ">
                    {WEEKLY_EVENTS[3].subtitle}
                  </p>
                </div>
              </>
            </div>
          </div>
          <Image
            src={"/sideImage.jpg"}
            alt="image"
            fill
            className="object-cover"></Image>
        </div>
        <div className="absolute md:right-0 bottom-0 max-md:-bottom-12">
          <ArrowButton
            direction="right"
            label="Group Booking"
            className="pl-0"></ArrowButton>
        </div>
      </div>
    </SectionComponent>
  );
};

export default WeeklyEvents;
