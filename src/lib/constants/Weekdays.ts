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

export const buildDefaultSchedules = (
  mode: "create" | "edit",
  initialOpeningHours?: DbOpeningHour[],
) => {
  // Group rows by day
  const byDay = new Map<Weekday, DbOpeningHour[]>();
  (initialOpeningHours ?? []).forEach((row) => {
    const arr = byDay.get(row.day) ?? [];
    arr.push(row);
    byDay.set(row.day, arr);
  });

  return WEEK_DAYS.map((day) => {
    const rows = byDay.get(day) ?? [];

    // If you have slot column, keep stable order
    rows.sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));

    if (rows.length > 0) {
      return {
        day,
        isClosed: false,
        slots: rows.map((r) => ({
          openTime: r.openTime,
          closeTime: r.closeTime,
        })),
      };
    }

    return {
      day,
      isClosed: mode === "edit" ? true : false,
      slots: [{ openTime: "09:00", closeTime: "22:00" }],
    };
  });
};
