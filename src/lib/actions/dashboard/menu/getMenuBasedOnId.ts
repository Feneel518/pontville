import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";

export const getMenuBasedOnId = async (id: string) => {
  await requireAuth();

  const menu = await prisma.menu.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      categories: {
        select: {
          id: true,
          name: true,
          status: true,
          slug: true,
          description: true,
        },
        orderBy: {
          status: "asc",
        },
      },
    },
  });

  return { ok: true, menu };
};
