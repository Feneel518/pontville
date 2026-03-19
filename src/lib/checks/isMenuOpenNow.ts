// export type OpeningHour = {
//   day: Weekday;
//   openTime: string;
//   closeTime: string;
// };

// import { MenuAvailabilityState } from "../types/menuAvailability";

// export type Weekday =
//   | "MONDAY"
//   | "TUESDAY"
//   | "WEDNESDAY"
//   | "THURSDAY"
//   | "FRIDAY"
//   | "SATURDAY"
//   | "SUNDAY";

// const weekdayToIndex: Record<Weekday, number> = {
//   SUNDAY: 0,
//   MONDAY: 1,
//   TUESDAY: 2,
//   WEDNESDAY: 3,
//   THURSDAY: 4,
//   FRIDAY: 5,
//   SATURDAY: 6,
// };

// function getNextOpenTime(openingHours: OpeningHour[], now: Date) {
//   const dayIdx = now.getDay();
//   const minutesNow = now.getHours() * 60 + now.getMinutes();

//   const candidates: { daysAhead: number; openMin: number; openTime: string }[] =
//     [];

//   for (const h of openingHours) {
//     const idx = weekdayToIndex[h.day];
//     const openMin = hhmmToMinutes(h.openTime);

//     let daysAhead = (idx - dayIdx + 7) % 7;

//     // if today, only if it's still upcoming
//     if (daysAhead === 0 && openMin <= minutesNow) continue;

//     candidates.push({ daysAhead, openMin, openTime: h.openTime });
//   }

//   candidates.sort((a, b) => a.daysAhead - b.daysAhead || a.openMin - b.openMin);

//   return candidates[0]?.openTime; // can be undefined if no hours exist
// }

// function hhmmToMinutes(hhmm: string) {
//   const [h, m] = hhmm.split(":").map((x) => Number(x));

//   return h * 60 + m;
// }

// export function isMenuOpenNow(opts: {
//   openingHours: OpeningHour[];
//   now: Date;
// }): {
//   isOpen: boolean;
//   closesAt?: string;
//   opensAt?: string;
// } {
//   const { now, openingHours } = opts;

//   const dayIdx = now.getDay();
//   const minutesNow = now.getHours() * 60 + now.getMinutes();

//   const todayHours = openingHours
//     .filter((h) => weekdayToIndex[h.day] === dayIdx)
//     .sort((a, b) => hhmmToMinutes(a.openTime) - hhmmToMinutes(b.openTime));

//   const yesterdayIdx = (dayIdx + 6) % 7;
//   const yesterdayOvernights = openingHours
//     .filter((h) => {
//       const idx = weekdayToIndex[h.day];
//       if (idx !== yesterdayIdx) return false;
//       return hhmmToMinutes(h.openTime) > hhmmToMinutes(h.closeTime); // overnight
//     })
//     .sort((a, b) => hhmmToMinutes(a.closeTime) - hhmmToMinutes(b.closeTime));

//   for (const h of yesterdayOvernights) {
//     const closeMin = hhmmToMinutes(h.closeTime);
//     if (minutesNow < closeMin) {
//       return { isOpen: true, closesAt: h.closeTime };
//     }
//   }

//   // 2) Check today's ranges
//   for (const h of todayHours) {
//     const openMin = hhmmToMinutes(h.openTime);
//     const closeMin = hhmmToMinutes(h.closeTime);

//     if (openMin === closeMin) continue; // treat as closed (or 24h if you want)

//     if (openMin < closeMin) {
//       console.log(minutesNow);

//       // same-day
//       if (minutesNow >= openMin && minutesNow < closeMin) {
//         return { isOpen: true, closesAt: h.closeTime };
//       }
//     } else {
//       // overnight starting today: openMin..24:00 OR 00:00..closeMin
//       if (minutesNow >= openMin || minutesNow < closeMin) {
//         return { isOpen: true, closesAt: h.closeTime };
//       }
//     }
//   }
//   // If closed, we can optionally compute next opensAt (simple: first interval today that is future)
//   const upcomingToday = todayHours
//     .map((h) => ({ h, openMin: hhmmToMinutes(h.openTime) }))
//     .filter(({ openMin }) => openMin > minutesNow)
//     .sort((a, b) => a.openMin - b.openMin)[0];

//   console.log(
//     todayHours
//       .map((h) => ({ h, openMin: hhmmToMinutes(h.openTime) }))
//       .filter((a) => a.openMin > minutesNow),
//   );

//   return {
//     isOpen: false,
//     opensAt: getNextOpenTime(openingHours, now) ,
//   };
// }

// V2
// export type OpeningHour = {
//   day: Weekday;
//   openTime: string;
//   closeTime: string;
// };

// export type Weekday =
//   | "MONDAY"
//   | "TUESDAY"
//   | "WEDNESDAY"
//   | "THURSDAY"
//   | "FRIDAY"
//   | "SATURDAY"
//   | "SUNDAY";

// const weekdayToIndex: Record<Weekday, number> = {
//   SUNDAY: 0,
//   MONDAY: 1,
//   TUESDAY: 2,
//   WEDNESDAY: 3,
//   THURSDAY: 4,
//   FRIDAY: 5,
//   SATURDAY: 6,
// };

// function hhmmToMinutes(hhmm: string) {
//   const [h, m] = hhmm.split(":").map(Number);
//   return h * 60 + m;
// }

// function addDays(date: Date, days: number) {
//   const d = new Date(date);
//   d.setDate(d.getDate() + days);
//   return d;
// }

// function setTimeOnDate(base: Date, hhmm: string) {
//   const [h, m] = hhmm.split(":").map(Number);
//   const d = new Date(base);
//   d.setHours(h, m, 0, 0);
//   return d;
// }

// function buildNext7DaysIntervals(openingHours: OpeningHour[], now: Date) {
//   const intervals: {
//     start: Date;
//     end: Date;
//     openTime: string;
//     closeTime: string;
//     day: Weekday;
//   }[] = [];

//   for (let offset = -1; offset <= 7; offset++) {
//     const date = addDays(now, offset);
//     const dayIdx = date.getDay();

//     const dayHours = openingHours.filter(
//       (h) => weekdayToIndex[h.day] === dayIdx,
//     );

//     for (const h of dayHours) {
//       const start = setTimeOnDate(date, h.openTime);
//       let end = setTimeOnDate(date, h.closeTime);

//       // overnight slot, e.g. 18:00 -> 02:00
//       if (hhmmToMinutes(h.openTime) > hhmmToMinutes(h.closeTime)) {
//         end = addDays(end, 1);
//       }

//       // ignore 00:00 style invalid same-time slot
//       if (start.getTime() === end.getTime()) continue;

//       intervals.push({
//         start,
//         end,
//         openTime: h.openTime,
//         closeTime: h.closeTime,
//         day: h.day,
//       });
//     }
//   }

//   return intervals.sort((a, b) => a.start.getTime() - b.start.getTime());
// }

// function getNextOpenTime(openingHours: OpeningHour[], now: Date) {
//   const intervals = buildNext7DaysIntervals(openingHours, now);
//   const next = intervals.find((i) => i.start.getTime() > now.getTime());
//   return next;
// }

// export function isMenuOpenNow(opts: {
//   openingHours: OpeningHour[];
//   now: Date;
//   timezone?: string;
// }): MenuAvailabilityState {
//   const { now, openingHours, timezone = "Australia/Hobart" } = opts;

//   if (!openingHours?.length) {
//     return {
//       isOpen: false,
//       message: "Currently closed",
//       opensAt: null,
//       closesAt: null,
//       nextChangeAt: null,
//       timezone,
//     };
//   }

//   const intervals = buildNext7DaysIntervals(openingHours, now);

//   const active = intervals.find(
//     (i) =>
//       now.getTime() >= i.start.getTime() && now.getTime() < i.end.getTime(),
//   );

//   if (active) {
//     return {
//       isOpen: true,
//       message: `Open now${active.closeTime ? ` • Closes at ${active.closeTime}` : ""}`,
//       opensAt: active.openTime,
//       closesAt: active.closeTime,
//       nextChangeAt: active.end.toISOString(),
//       timezone,
//     };
//   }

//   const next = intervals.find((i) => i.start.getTime() > now.getTime());

//   return {
//     isOpen: false,
//     message: next?.openTime
//       ? `Closed • Opens at ${next.openTime}`
//       : "Currently closed",
//     opensAt: next?.openTime ?? null,
//     closesAt: null,
//     nextChangeAt: next?.start.toISOString() ?? null,
//     timezone,
//   };
// }

// v3
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
      opensAt: null,
      closesAt: null,
      nextChangeAt: null,
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
    opensAt: next?.openTime ?? null,
    closesAt: null,
    nextChangeAt: next?.start.toISOString() ?? null,
    timezone,
  };
}
