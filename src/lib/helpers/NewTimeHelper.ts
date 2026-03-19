import { Weekday } from "@prisma/client";

export function timeToMinutes(hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);

  if (
    !Number.isInteger(hh) ||
    !Number.isInteger(mm) ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    throw new Error(`Invalid time: "${hhmm}" (expected "HH:mm")`);
  }

  return hh * 60 + mm;
}

export function getWeekdayEnum(date: Date): Weekday {
  const day = date.getDay();

  switch (day) {
    case 0:
      return "SUNDAY";
    case 1:
      return "MONDAY";
    case 2:
      return "TUESDAY";
    case 3:
      return "WEDNESDAY";
    case 4:
      return "THURSDAY";
    case 5:
      return "FRIDAY";
    case 6:
      return "SATURDAY";
    default:
      return "MONDAY";
  }
}

export function to12HourTime(hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);

  if (
    !Number.isInteger(hh) ||
    !Number.isInteger(mm) ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    throw new Error(`Invalid time: "${hhmm}" (expected "HH:mm")`);
  }

  const period = hh >= 12 ? "PM" : "AM";
  const hours12 = hh % 12 === 0 ? 12 : hh % 12;

  return `${hours12}:${mm.toString().padStart(2, "0")} ${period}`;
}
