export function getBadgeVariantFromStatus(status: string) {
  switch (status) {
    case "NEW":
      return "new";
    case "ACCEPTED":
      return "success";
    case "PREPARING":
      return "preparing";
    case "READY":
      return "ready";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";

    // payment examples
    case "PAID":
      return "success";
    case "UNPAID":
      return "warning";
    case "FAILED":
      return "error";
    case "REFUNDED":
      return "info";

    default:
      return "default";
  }
}
