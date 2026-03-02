import { Prisma } from "@prisma/client";
import { menuQP } from "./MenuSearchParams";

export const buildMenusWhere = (sp: menuQP) => {
  const and: Prisma.MenuWhereInput[] = [];

  if (sp.q) {
    and.push({
      OR: [
        {
          name: { contains: sp.q, mode: "insensitive" },
          slug: { contains: sp.q, mode: "insensitive" },
          description: { contains: sp.q, mode: "insensitive" },
        },
      ],
    });
  }

  if (sp.status === "ACTIVE") and.push({ status: "ACTIVE" });
  if (sp.status === "INACTIVE") and.push({ status: "INACTIVE" });

  return { AND: and };
};

export const buildMenusOrderBy = (sp: menuQP) => {
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
