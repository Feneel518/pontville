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

function getNextOpenTime(openingHours: OpeningHour[], now: Date) {
  const dayIdx = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const candidates: { daysAhead: number; openMin: number; openTime: string }[] =
    [];

  for (const h of openingHours) {
    const idx = weekdayToIndex[h.day];
    const openMin = hhmmToMinutes(h.openTime);

    let daysAhead = (idx - dayIdx + 7) % 7;

    // if today, only if it's still upcoming
    if (daysAhead === 0 && openMin <= minutesNow) continue;

    candidates.push({ daysAhead, openMin, openTime: h.openTime });
  }

  candidates.sort((a, b) => a.daysAhead - b.daysAhead || a.openMin - b.openMin);

  return candidates[0]?.openTime; // can be undefined if no hours exist
}

function hhmmToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map((x) => Number(x));

  return h * 60 + m;
}

export function isMenuOpenNow(opts: {
  openingHours: OpeningHour[];
  now: Date;
}): {
  isOpen: boolean;
  closesAt?: string;
  opensAt?: string;
} {
  const { now, openingHours } = opts;

  const dayIdx = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const todayHours = openingHours
    .filter((h) => weekdayToIndex[h.day] === dayIdx)
    .sort((a, b) => hhmmToMinutes(a.openTime) - hhmmToMinutes(b.openTime));

  const yesterdayIdx = (dayIdx + 6) % 7;
  const yesterdayOvernights = openingHours
    .filter((h) => {
      const idx = weekdayToIndex[h.day];
      if (idx !== yesterdayIdx) return false;
      return hhmmToMinutes(h.openTime) > hhmmToMinutes(h.closeTime); // overnight
    })
    .sort((a, b) => hhmmToMinutes(a.closeTime) - hhmmToMinutes(b.closeTime));

  for (const h of yesterdayOvernights) {
    const closeMin = hhmmToMinutes(h.closeTime);
    if (minutesNow < closeMin) {
      return { isOpen: true, closesAt: h.closeTime };
    }
  }

  // 2) Check today's ranges
  for (const h of todayHours) {
    const openMin = hhmmToMinutes(h.openTime);
    const closeMin = hhmmToMinutes(h.closeTime);

    if (openMin === closeMin) continue; // treat as closed (or 24h if you want)

    if (openMin < closeMin) {
      console.log(minutesNow);

      // same-day
      if (minutesNow >= openMin && minutesNow < closeMin) {
        return { isOpen: true, closesAt: h.closeTime };
      }
    } else {
      // overnight starting today: openMin..24:00 OR 00:00..closeMin
      if (minutesNow >= openMin || minutesNow < closeMin) {
        return { isOpen: true, closesAt: h.closeTime };
      }
    }
  }
  // If closed, we can optionally compute next opensAt (simple: first interval today that is future)
  const upcomingToday = todayHours
    .map((h) => ({ h, openMin: hhmmToMinutes(h.openTime) }))
    .filter(({ openMin }) => openMin > minutesNow)
    .sort((a, b) => a.openMin - b.openMin)[0];

  console.log(
    todayHours
      .map((h) => ({ h, openMin: hhmmToMinutes(h.openTime) }))
      .filter((a) => a.openMin > minutesNow),
  );

  return {
    isOpen: false,
    opensAt: getNextOpenTime(openingHours, now) ,
  };
}
