function toNumberSafe(v: unknown) {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
}
export function formatUsd(v: string | number | null | undefined) {
  const n = toNumberSafe(v);
  if (n == null) return "—";
  return `$${n.toFixed(2).replace(/\.00$/, "")}`;
}
