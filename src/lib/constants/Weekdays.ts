import { MenuOpeningHour } from "@prisma/client";

export const WEEK_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

type Weekday = (typeof WEEK_DAYS)[number];

type DbOpeningHour = {
  day: Weekday;
  openTime: string;
  closeTime: string;
  slot?: number | null; // if you add slot field
};

export function buildDefaultSchedules(
  mode: "create" | "edit",
  openingHours?: MenuOpeningHour[],
) {
  if (mode === "create" || !openingHours?.length) {
    return WEEK_DAYS.map((day) => ({
      day,
      isClosed: false,
      slots: [{ openTime: "09:00", closeTime: "18:00" }],
    }));
  }

  return WEEK_DAYS.map((day) => {
    const rows = openingHours
      .filter((row) => row.day === day)
      .sort((a, b) => a.slot - b.slot);

    const hasClosedRow = rows.some((row) => row.isClosed);

    if (hasClosedRow) {
      return {
        day,
        isClosed: true,
        slots: [],
      };
    }

    return {
      day,
      isClosed: false,
      slots:
        rows.length > 0
          ? rows.map((row) => ({
              openTime: row.openTime,
              closeTime: row.closeTime,
            }))
          : [{ openTime: "09:00", closeTime: "18:00" }],
    };
  });
}
