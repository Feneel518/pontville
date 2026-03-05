// app/events/page.tsx
import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  CalendarDays,
  Clock,
  MapPin,
  Music,
  Sparkles,
  Ticket,
  Utensils,
  Users,
} from "lucide-react";
import EventHero from "@/components/frontend/events/EventHero";
import UpcomingEvents from "@/components/frontend/events/UpcomingEvents";
import WeeklyEvents from "@/components/frontend/events/WeeklyEvents";
import FunctionEvents from "@/components/frontend/events/FunctionEvents";
import { prisma } from "@/lib/prisma/db";

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

const WEEKLY_EVENTS = [
  {
    icon: Music,
    title: "Live Music Fridays",
    subtitle: "From 7 PM • Local artists",
  },
  {
    icon: Sparkles,
    title: "Trivia Thursdays",
    subtitle: "From 6:30 PM • Prizes to win",
  },
  {
    icon: Utensils,
    title: "Midweek Dinner Specials",
    subtitle: "Wed–Thu • Seasonal menu offers",
  },
  {
    icon: Users,
    title: "Sunday Sessions",
    subtitle: "Chill afternoon vibes • Family-friendly",
  },
];

function typeBadge(type: EventType) {
  switch (type) {
    case "LIVE_MUSIC":
      return (
        <Badge className="gap-1">
          <Music className="h-3.5 w-3.5" /> Live Music
        </Badge>
      );
    case "TRIVIA":
      return (
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3.5 w-3.5" /> Trivia
        </Badge>
      );
    case "SPECIAL":
      return (
        <Badge variant="outline" className="gap-1">
          <Ticket className="h-3.5 w-3.5" /> Special
        </Badge>
      );
    case "SPORTS":
      return <Badge variant="secondary">Sports</Badge>;
    case "FOOD":
      return (
        <Badge variant="secondary">
          <Utensils className="h-3.5 w-3.5" /> Food
        </Badge>
      );
    default:
      return <Badge variant="outline">Event</Badge>;
  }
}

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
    },
  });

  const promos = await prisma.promoBanner.findMany({
    where: {
      isActive: true,
    },
  });
  return (
    <>
      <main className="min-h-screen bg-background  font-sans">
        {/* Background glow */}
        <div className="pointer-events-none fixed inset-0 opacity-70">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl bg-red-700/20" />
          <div className="absolute top-40 right-[-120px] h-[420px] w-[420px] rounded-full blur-3xl bg-pink-600/20" />
          <div className="absolute bottom-40 left-[-140px] h-[520px] w-[520px] rounded-full blur-3xl bg-primary/20" />
        </div>
        <div className="h-svh -mt-16 md:-mt-20 ">
          <EventHero></EventHero>
        </div>
        <UpcomingEvents event={events}></UpcomingEvents>
        <WeeklyEvents promos={promos}></WeeklyEvents>
        <FunctionEvents></FunctionEvents>
      </main>
    </>
  );
}
