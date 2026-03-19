export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type OpeningHour = {
  day: Weekday;
  openTime: string; // "11:00"
  closeTime: string; // "23:00"
  isClosed: boolean;
};

export type MenuAvailabilityResult = {
  isOpen: boolean;
  message: string;
  opensAt?: string;
  closesAt?: string;
  nextChangeAt?: string;
  timezone: string;
};

const WEEKDAYS: Weekday[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export function parseHHMMToMinutes(value: string) {
  const [hh, mm] = value.split(":").map(Number);

  if (
    Number.isNaN(hh) ||
    Number.isNaN(mm) ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    throw new Error(`Invalid time: "${value}"`);
  }

  return hh * 60 + mm;
}

export function formatMinutesTo12Hour(totalMinutes: number) {
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  const period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;

  return `${hour12}:${String(mm).padStart(2, "0")} ${period}`;
}

export function getCurrentPartsInTimezone(timezone: string) {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const weekdayRaw = parts.find((p) => p.type === "weekday")?.value;
  const hourRaw = parts.find((p) => p.type === "hour")?.value;
  const minuteRaw = parts.find((p) => p.type === "minute")?.value;

  if (!weekdayRaw || hourRaw == null || minuteRaw == null) {
    throw new Error("Failed to read current time");
  }

  return {
    weekday: weekdayRaw.toUpperCase() as Weekday,
    currentMinutes: Number(hourRaw) * 60 + Number(minuteRaw),
  };
}

function sortSlotsByOpenTime(slots: OpeningHour[]) {
  return [...slots].sort(
    (a, b) => parseHHMMToMinutes(a.openTime) - parseHHMMToMinutes(b.openTime),
  );
}

function getNextOpenSlot(
  openingHours: OpeningHour[],
  currentDay: Weekday,
  currentMinutes: number,
) {
  const currentDayIndex = WEEKDAYS.indexOf(currentDay);

  for (let offset = 0; offset < 7; offset++) {
    const dayIndex = (currentDayIndex + offset) % 7;
    const day = WEEKDAYS[dayIndex];

    const daySlots = sortSlotsByOpenTime(
      openingHours.filter((slot) => slot.day === day && !slot.isClosed),
    );

    if (daySlots.length === 0) continue;

    if (offset === 0) {
      const laterTodaySlot = daySlots.find(
        (slot) => parseHHMMToMinutes(slot.openTime) > currentMinutes,
      );

      if (laterTodaySlot) {
        return {
          day,
          openMinutes: parseHHMMToMinutes(laterTodaySlot.openTime),
        };
      }
    } else {
      return {
        day,
        openMinutes: parseHHMMToMinutes(daySlots[0].openTime),
      };
    }
  }

  return null;
}
export function getMenuAvailabilityNew(
  openingHours: OpeningHour[],
  timezone: string,
): MenuAvailabilityResult {
  const { weekday, currentMinutes } = getCurrentPartsInTimezone(timezone);

  const todaySlots = sortSlotsByOpenTime(
    openingHours.filter((slot) => slot.day === weekday && !slot.isClosed),
  );

  // 1. Check if user is currently inside any slot
  for (const slot of todaySlots) {
    const openMinutes = parseHHMMToMinutes(slot.openTime);
    const closeMinutes = parseHHMMToMinutes(slot.closeTime);

    const isOpenNow =
      currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    if (isOpenNow) {
      return {
        isOpen: true,
        message: `Open now · Closes at ${formatMinutesTo12Hour(closeMinutes)}`,
        closesAt: formatMinutesTo12Hour(closeMinutes),
        nextChangeAt: slot.closeTime,
        timezone: timezone,
      };
    }
  }

  // 2. If not open, check if another slot exists later today
  const nextTodaySlot = todaySlots.find(
    (slot) => parseHHMMToMinutes(slot.openTime) > currentMinutes,
  );

  if (nextTodaySlot) {
    const openMinutes = parseHHMMToMinutes(nextTodaySlot.openTime);

    return {
      isOpen: false,
      message: `Opens at ${formatMinutesTo12Hour(openMinutes)}`,
      opensAt: formatMinutesTo12Hour(openMinutes),
      nextChangeAt: nextTodaySlot.openTime,
      timezone: timezone,
    };
  }

  // 3. No more slots today, so check next days
  const nextOpen = getNextOpenSlot(openingHours, weekday, currentMinutes);

  if (!nextOpen) {
    return {
      isOpen: false,
      message: "Currently closed",
      timezone: timezone,
    };
  }

  return {
    isOpen: false,
    message:
      nextOpen.day === weekday
        ? `Opens at ${formatMinutesTo12Hour(nextOpen.openMinutes)}`
        : `Opens ${nextOpen.day.toLowerCase()} at ${formatMinutesTo12Hour(nextOpen.openMinutes)}`,
    opensAt: formatMinutesTo12Hour(nextOpen.openMinutes),
    timezone: timezone,
  };
}
