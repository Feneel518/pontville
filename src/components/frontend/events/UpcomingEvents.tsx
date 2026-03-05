"use client";

import { CalendarDays, Clock, Ticket } from "lucide-react";
import React, { FC } from "react";

import Link from "next/link";

import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import ArrowButton from "@/components/ui/ArrowButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { typeBadge } from "@/lib/helpers/uiHelpers";
import Image from "next/image";
import { Event } from "@prisma/client";
import { format } from "date-fns";
import { formatEventDateLabel, to12HourTime } from "@/lib/helpers/timeHelpers";
import { BookTableButton } from "@/components/global/BookTableButton";

interface UpcomingEventsProps {
  event: Event[];
}

type EventType =
  | "LIVE_MUSIC"
  | "TRIVIA"
  | "SPECIAL"
  | "SPORTS"
  | "FOOD"
  | "OTHER";

type EventItem = {
  id: string;
  title: string;
  type: EventType;
  dateLabel: string; // e.g. "Fri, 21 Mar 2026"
  timeLabel: string; // e.g. "7:00 PM – Late"
  description: string;
  isTicketed?: boolean;
  priceLabel?: string; // e.g. "$15 pp"
  highlight?: string; // e.g. "Happy Hour 5–7 PM"
  ctaLabel?: string; // e.g. "Book a table"
  ctaHref?: string; // e.g. "/contact"
};

const UpcomingEvents: FC<UpcomingEventsProps> = ({ event }) => {
  const UPCOMING_EVENTS: EventItem[] = [
    {
      id: "ev-live-music",
      title: "Friday Night Live Music",
      type: "LIVE_MUSIC",
      dateLabel: "Fri, 13 Feb 2026",
      timeLabel: "7:00 PM – Late",
      description:
        "Local acoustic set + pub classics. Great vibes, good food, cold drinks.",
      highlight: "Happy Hour 5–7 PM",
      ctaLabel: "Book a table",
      ctaHref: "/contact",
    },
    {
      id: "ev-trivia",
      title: "Thursday Trivia Night",
      type: "TRIVIA",
      dateLabel: "Thu, 19 Feb 2026",
      timeLabel: "6:30 PM – 9:00 PM",
      description:
        "Bring your team, win prizes, and enjoy dinner specials during the quiz.",
      highlight: "Prizes + dinner specials",
      ctaLabel: "Reserve a spot",
      ctaHref: "/contact",
    },
    {
      id: "ev-special",
      title: "Chef’s Seasonal Tasting",
      type: "SPECIAL",
      dateLabel: "Sat, 28 Feb 2026",
      timeLabel: "6:00 PM – 9:00 PM",
      description:
        "A curated seasonal menu with paired options. Limited seats available.",
      isTicketed: true,
      priceLabel: "$45 pp",
      highlight: "Limited seating",
      ctaLabel: "Enquire",
      ctaHref: "/contact",
    },
  ];

  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [current, setCurrent] = React.useState(1);
  const [count, setCount] = React.useState(UPCOMING_EVENTS.length);

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
        <Heading label="Upcoming Events"></Heading>
        {event.length > 3 && (
          <div className="hidden items-center justify-end py-8 md:flex">
            <div className="" onClick={() => api?.scrollPrev()}>
              <ArrowButton
                direction="left"
                label="Prev"
                showLabel={false}></ArrowButton>
            </div>
            <div className="font-serif text-xl text-secondary-foreground">
              {String(current).padStart(2, "0")}/
              {String(count).padStart(2, "0")}
            </div>
            <div className="" onClick={() => api?.scrollNext()}>
              <ArrowButton
                direction="right"
                label="Next"
                showLabel={false}></ArrowButton>
            </div>
          </div>
        )}
      </div>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full">
        <CarouselContent className="-ml-4">
          {event.map((ev, idx) => (
            <CarouselItem
              key={idx}
              className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <Card key={ev.id} className="rounded-2xl group">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    {typeBadge(ev.type)}
                    {ev.isTicketed ? (
                      <Badge variant="outline" className="gap-1">
                        <Ticket className="h-3.5 w-3.5" />
                        {ev.priceLabel ?? "Ticketed"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Free entry</Badge>
                    )}
                  </div>
                  <div className="w-full h-64 overflow-hidden relative">
                    <Image
                      alt="Event Image"
                      src={"/Book.jpg"}
                      fill
                      className="object-cover group-hover:scale-105 transition-all duration-300 ease-in-out"></Image>
                  </div>

                  <CardTitle className="text-xl">{ev.title}</CardTitle>

                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary/80" />
                      <span>{formatEventDateLabel(ev.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary/80" />
                      <span>{to12HourTime(ev.startTime)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {ev.description}
                  </p>

                  {ev.highlight ? (
                    <div className="rounded-xl border bg-card px-3 py-2 text-sm">
                      <span className="font-medium">Highlight:</span>{" "}
                      <span className="text-muted-foreground">
                        {ev.highlight}
                      </span>
                    </div>
                  ) : null}

                  <Button asChild className="w-full" variant={"elegant"}>
                    <BookTableButton
                      type={
                        ev.ctaLabel?.toLowerCase().includes("table")
                          ? "TABLE"
                          : "EVENT"
                      }
                      trigger={
                        <Button className="w-full" variant={"elegantFull"}>
                          {ev.ctaLabel}
                        </Button>
                      }></BookTableButton>
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </SectionComponent>
  );
};

export default UpcomingEvents;
