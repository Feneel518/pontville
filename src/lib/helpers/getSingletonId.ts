"use server";

import { prisma } from "@/lib/prisma/db";
import { slugify } from "./SlugHelper";

export async function getSingletonId() {
  const existing = await prisma.restaurant.findFirst({
    select: { id: true },
  });
  if (existing?.id) return existing.id;

  const created = await prisma.restaurant.create({
    data: {
      name: "The Pontville Pub",
      hoursJson: {
        restaurant: "10:00 to 21:00",
        notes: "",
      },
      allowIndexing: true,
      slug: slugify("The Pontville Pub"),
    },
    select: { id: true },
  });

  return created.id;
}
