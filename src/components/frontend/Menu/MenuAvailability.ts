import { MenuAvailabilityState } from "@/lib/types/menuAvailability";
import {
  Weekday,
  weekdayToIndex,
  indexToWeekday,
} from "@/lib/helpers/WeekDaysHelpers";

type OpeningHourInput = {
  day: Weekday;
  isClosed?: boolean | null;
  openTime?: string | null;
  closeTime?: string | null;
};

type GetMenuAvailabilityArgs = {
  openingHours: OpeningHourInput[];
  now?: Date;
  timezone?: string;
};

function parseTimeToMinutes(value?: string | null) {
  if (!value) return null;

  const [h, m] = value.split(":").map(Number);

  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;

  return h * 60 + m;
}

function formatTime(value?: string | null) {
  if (!value) return undefined;

  const [h, m] = value.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return undefined;

  const date = new Date();
  date.setHours(h, m, 0, 0);

  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getLocalDayAndMinutes(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);

  const dayMap: Record<string, Weekday> = {
    Monday: "MONDAY",
    Tuesday: "TUESDAY",
    Wednesday: "WEDNESDAY",
    Thursday: "THURSDAY",
    Friday: "FRIDAY",
    Saturday: "SATURDAY",
    Sunday: "SUNDAY",
  };

  return {
    day: dayMap[weekday ?? "Sunday"] ?? "SUNDAY",
    minutesNow: hour * 60 + minute,
  };
}

function getNextChangeAt(
  now: Date,
  timezone: string,
  dayOffset: number,
  targetMinutes: number,
) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + dayOffset);
  base.setUTCHours(Math.floor(targetMinutes / 60), targetMinutes % 60, 0, 0);

  return base.toISOString();
}

export function getMenuAvailability({
  openingHours,
  now = new Date(),
  timezone = "Australia/Hobart",
}: GetMenuAvailabilityArgs): MenuAvailabilityState {
  if (!openingHours?.length) {
    return {
      isOpen: false,
      message: "Currently closed",
      timezone,
    };
  }

  const { day, minutesNow } = getLocalDayAndMinutes(now, timezone);

  const today = openingHours.find((x) => x.day === day);

  const todayOpen = parseTimeToMinutes(today?.openTime);
  const todayClose = parseTimeToMinutes(today?.closeTime);

  const todayIsValid =
    today &&
    !today.isClosed &&
    todayOpen != null &&
    todayClose != null &&
    todayOpen < todayClose;

  if (todayIsValid) {
    if (minutesNow >= todayOpen && minutesNow < todayClose) {
      return {
        isOpen: true,
        message: `Open now · Closes ${formatTime(today.closeTime)}`,
        closesAt: formatTime(today.closeTime),
        nextChangeAt: getNextChangeAt(now, timezone, 0, todayClose),
        timezone,
      };
    }

    if (minutesNow < todayOpen) {
      return {
        isOpen: false,
        message: `Closed now · Opens ${formatTime(today.openTime)}`,
        opensAt: formatTime(today.openTime),
        nextChangeAt: getNextChangeAt(now, timezone, 0, todayOpen),
        timezone,
      };
    }
  }

  const todayIndex = weekdayToIndex(day);

  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = indexToWeekday(todayIndex + offset);
    const nextHours = openingHours.find((x) => x.day === nextDay);

    const nextOpen = parseTimeToMinutes(nextHours?.openTime);
    const nextClose = parseTimeToMinutes(nextHours?.closeTime);

    if (
      nextHours &&
      !nextHours.isClosed &&
      nextOpen != null &&
      nextClose != null &&
      nextOpen < nextClose
    ) {
      return {
        isOpen: false,
        message: `Closed now · Opens ${formatTime(nextHours.openTime)}`,
        opensAt: formatTime(nextHours.openTime),
        nextChangeAt: getNextChangeAt(now, timezone, offset, nextOpen),
        timezone,
      };
    }
  }

  return {
    isOpen: false,
    message: "Currently closed",
    timezone,
  };
}
