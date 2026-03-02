export function to12HourTime(hhmm: string): string {
  const [hhStr, mmStr] = hhmm.split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);

  if (
    !Number.isFinite(hh) ||
    !Number.isFinite(mm) ||
    mm < 0 ||
    mm > 59 ||
    hh < 0 ||
    hh > 23
  ) {
    throw new Error(`Invalid time: "${hhmm}" (expected "HH:mm")`);
  }

  const period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;

  // keep minutes padded (e.g. 11:05)
  const minutes = String(mm).padStart(2, "0");

  return `${hour12}:${minutes} ${period}`;
}
