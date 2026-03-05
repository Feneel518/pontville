"use server";

import { prisma } from "@/lib/prisma/db";
import { z } from "zod";

const schema = z.object({
  q: z.string().trim().min(3).max(200), // email or phone
});

export async function listPublicBookings(raw: z.infer<typeof schema>) {
  const { q } = schema.parse(raw);

  // normalize phone a bit (basic)
  const qPhone = q.replace(/\s+/g, "");

  const rows = await prisma.inquiry.findMany({
    where: {
      OR: [
        { email: { equals: q.toLowerCase() } },
        { phone: { equals: qPhone } },
        // fallback contains (optional; comment out if you want strict match)
        { email: { contains: q.toLowerCase(), mode: "insensitive" } },
        { phone: { contains: qPhone } },
      ],
    },
    include: {
      tableInquiry: true,
      eventInquiry: true,
      restaurant: {
        select: { name: true, logoUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return rows;
}
