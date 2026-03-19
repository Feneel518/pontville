import { DateTime } from "luxon";

export type OpeningHourInput = {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  opensAt: string; // "09:00"
  closesAt: string; // "17:00"
  isActive?: boolean;
};

export type MenuAvailabilityResult = {
  isOpen: boolean;
  message: string;
  opensAt: string | null;
  closesAt: string | null;
  nextChangeAt: string | null; // ISO
  timezone: string;
};

type Interval = {
  start: DateTime;
  end: DateTime;
};

function jsDayToLuxonWeekday(day: number) {
  // JS: 0=Sun, 1=Mon ... 6=Sat
  // Luxon: 1=Mon ... 7=Sun
  return day === 0 ? 7 : day;
}

function timeParts(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

function buildWeekIntervals(
  hours: OpeningHourInput[],
  timezone: string,
  now: DateTime,
): Interval[] {
  const startOfWeek = now.startOf("week"); // Luxon week starts Monday

  const intervals: Interval[] = [];

  for (const row of hours) {
    if (row.isActive === false) continue;

    const targetWeekday = jsDayToLuxonWeekday(row.dayOfWeek);
    const dayBase = startOfWeek.plus({ days: targetWeekday - 1 });

    const openTime = timeParts(row.opensAt);
    const closeTime = timeParts(row.closesAt);

    let start = dayBase.set({
      hour: openTime.hour,
      minute: openTime.minute,
      second: 0,
      millisecond: 0,
    });

    let end = dayBase.set({
      hour: closeTime.hour,
      minute: closeTime.minute,
      second: 0,
      millisecond: 0,
    });

    // Overnight window: e.g. 18:00 -> 02:00
    if (end <= start) {
      end = end.plus({ days: 1 });
    }

    intervals.push({ start, end });
  }

  return intervals.sort((a, b) => a.start.toMillis() - b.start.toMillis());
}

function formatTime(dt: DateTime) {
  return dt.toFormat("h:mm a");
}

function formatDayTime(dt: DateTime, now: DateTime) {
  if (dt.hasSame(now, "day")) return `today at ${formatTime(dt)}`;
  if (dt.hasSame(now.plus({ days: 1 }), "day"))
    return `tomorrow at ${formatTime(dt)}`;
  return `${dt.toFormat("ccc")} at ${formatTime(dt)}`;
}

export function getMenuAvailability(params: {
  hours: OpeningHourInput[];
  timezone: string;
  now?: Date;
}): MenuAvailabilityResult {
  const { hours, timezone } = params;
  const now = params.now
    ? DateTime.fromJSDate(params.now).setZone(timezone)
    : DateTime.now().setZone(timezone);

  if (!hours.length) {
    return {
      isOpen: false,
      message: "Currently unavailable",
      opensAt: null,
      closesAt: null,
      nextChangeAt: null,
      timezone,
    };
  }

  // Build intervals for previous week, current week, next week
  // so overnight and upcoming windows are always handled safely.
  const currentWeek = buildWeekIntervals(hours, timezone, now);
  const prevWeek = buildWeekIntervals(hours, timezone, now.minus({ weeks: 1 }));
  const nextWeek = buildWeekIntervals(hours, timezone, now.plus({ weeks: 1 }));

  const intervals = [...prevWeek, ...currentWeek, ...nextWeek].sort(
    (a, b) => a.start.toMillis() - b.start.toMillis(),
  );

  const active = intervals.find(
    (interval) => now >= interval.start && now < interval.end,
  );

  if (active) {
    return {
      isOpen: true,
      message: `Open now · Closes ${formatDayTime(active.end, now)}`,
      opensAt: active.start.toISO(),
      closesAt: active.end.toISO(),
      nextChangeAt: active.end.toISO(),
      timezone,
    };
  }

  const nextOpen = intervals.find((interval) => interval.start > now);

  if (!nextOpen) {
    return {
      isOpen: false,
      message: "Currently closed",
      opensAt: null,
      closesAt: null,
      nextChangeAt: null,
      timezone,
    };
  }

  return {
    isOpen: false,
    message: `Closed · Opens ${formatDayTime(nextOpen.start, now)}`,
    opensAt: nextOpen.start.toISO(),
    closesAt: nextOpen.end.toISO(),
    nextChangeAt: nextOpen.start.toISO(),
    timezone,
  };
}
