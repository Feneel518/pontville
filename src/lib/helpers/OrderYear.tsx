export function getOrderYear(d = new Date()) {
  // Calendar year (simple)
  return d.getFullYear();

  // If you want India FY (Apr–Mar), use:
  // const m = d.getMonth() + 1;
  // return m >= 4 ? d.getFullYear() : d.getFullYear() - 1;
}
