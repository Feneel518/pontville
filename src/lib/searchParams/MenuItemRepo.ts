import { Prisma } from "@prisma/client";
import { menuItemQP } from "./MenuItemSearchParams";

export const buildMenuItemWhere = (sp: menuItemQP, slug: string) => {
  const and: Prisma.MenuItemWhereInput[] = [];
  const q = sp.q?.trim();

  and.push({
    category: {
      slug,
    },
  });
  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (sp.status === "ACTIVE") and.push({ status: "ACTIVE" });
  if (sp.status === "INACTIVE") and.push({ status: "INACTIVE" });

  if (sp.available === "AVAILABLE") and.push({ isAvailable: true });
  if (sp.available === "UNAVAILABLE") and.push({ isAvailable: false });

  return { AND: and };
};

export const buildMenuItemOrderBy = (sp: menuItemQP) => {
  const dir = sp.dir;

  switch (sp.sort) {
    case "name":
      return { name: dir };
    case "status":
      return { status: dir };
    case "createdAt":
    default:
      return { createdAt: dir };
  }
};
