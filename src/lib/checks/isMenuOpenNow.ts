import type { MenuAvailabilityState } from "@/lib/types/menuAvailability";

export type OpeningHour = {
  day: Weekday;
  openTime: string;
  closeTime: string;
};

export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

const weekdayToIndex: Record<Weekday, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

function hhmmToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function setTimeOnDate(base: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function buildIntervals(openingHours: OpeningHour[], now: Date) {
  const intervals: {
    start: Date;
    end: Date;
    openTime: string;
    closeTime: string;
    day: Weekday;
  }[] = [];

  for (let offset = -1; offset <= 7; offset++) {
    const date = addDays(now, offset);
    const dayIdx = date.getDay();

    const dayHours = openingHours.filter(
      (h) => weekdayToIndex[h.day] === dayIdx,
    );

    for (const h of dayHours) {
      const start = setTimeOnDate(date, h.openTime);
      let end = setTimeOnDate(date, h.closeTime);

      if (hhmmToMinutes(h.openTime) > hhmmToMinutes(h.closeTime)) {
        end = addDays(end, 1);
      }

      if (start.getTime() === end.getTime()) continue;

      intervals.push({
        start,
        end,
        openTime: h.openTime,
        closeTime: h.closeTime,
        day: h.day,
      });
    }
  }

  return intervals.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function isMenuOpenNow(opts: {
  openingHours: OpeningHour[];
  now: Date;
  timezone?: string;
}): MenuAvailabilityState {
  const { now, openingHours, timezone = "Australia/Hobart" } = opts;

  if (!openingHours?.length) {
    return {
      isOpen: false,
      message: "Currently closed",
      opensAt: undefined,
      closesAt: undefined,
      nextChangeAt: undefined,
      timezone,
    };
  }

  const intervals = buildIntervals(openingHours, now);

  const active = intervals.find(
    (i) =>
      now.getTime() >= i.start.getTime() && now.getTime() < i.end.getTime(),
  );

  if (active) {
    return {
      isOpen: true,
      message: `Open now${active.closeTime ? ` • Closes at ${active.closeTime}` : ""}`,
      opensAt: active.openTime,
      closesAt: active.closeTime,
      nextChangeAt: active.end.toISOString(),
      timezone,
    };
  }

  const next = intervals.find((i) => i.start.getTime() > now.getTime());

  return {
    isOpen: false,
    message: next?.openTime
      ? `Closed • Opens at ${next.openTime}`
      : "Currently closed",
    opensAt: next?.openTime ?? undefined,
    closesAt: undefined,
    nextChangeAt: next?.start.toISOString() ?? undefined,
    timezone,
  };
}
