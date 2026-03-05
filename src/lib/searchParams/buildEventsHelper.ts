import { EventsQP } from "@/lib/searchParams/EventSearchParams";
import { EventStatus, Prisma } from "@prisma/client";

export function buildEventsWhere(sp: EventsQP) {
  const and: Prisma.EventWhereInput[] = [];

  // search
  if (sp.q) {
    and.push({
      OR: [
        { title: { contains: sp.q, mode: "insensitive" } },
        { description: { contains: sp.q, mode: "insensitive" } },
        { highlight: { contains: sp.q, mode: "insensitive" } },
        // optional: searching cta label/href can be useful in admin
        { ctaLabel: { contains: sp.q, mode: "insensitive" } },
        { ctaHref: { contains: sp.q, mode: "insensitive" } },
        { priceLabel: { contains: sp.q, mode: "insensitive" } },
      ],
    });
  }

  // status filter
  if (sp.status !== "ALL") {
    and.push({ status: sp.status as EventStatus });
  }



  // time filter (computed against startsAt)
  const now = new Date();
  if (sp.time === "UPCOMING") {
    and.push({ startDate: { gte: now } });
  }
  if (sp.time === "PAST") {
    and.push({ startDate: { lt: now } });
  }

  return { AND: and };
}

export function buildEventsOrderBy(qp: EventsQP) {
  const dir = qp.dir;

  switch (qp.sort) {
    case "title":
      return { title: dir };

    case "status":
      return { status: dir };

    case "startDate":
      return { startsAt: dir };

    case "createdAt":
    default:
      return { createdAt: dir };
  }
}
