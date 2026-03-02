"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";
import {
  MenuItemSchema,
  MenuItemSchemaRequest,
} from "@/lib/validators/menuItemValidator";
import { revalidatePath } from "next/cache";

export const createMenuItemAction = async (value: MenuItemSchemaRequest) => {
  const session = await requireAuth();

  const parsed = MenuItemSchema.safeParse(value);

  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid data",
    };
  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const created = await tx.menuItem.create({
        data: {
          categoryId: data.categoryId,
          name: data.name,
          slug: data.slug!,
          description: data.description || null,
          imageUrl: data.imageUrl || null,

          priceType: data.priceType,
          basePrice: data.basePrice || null,
          status: data.status,
          isAvailable: data.isAvailable,
          sortOrder: data.sortOrder,
          isVeg: data.isVeg,
          isVegan: data.isVegan,

          variants:
            data.priceType === "VARIANT"
              ? {
                  create: data.variants.map((v) => {
                    return {
                      name: v.name,
                      price: v.price,
                      isAvailable: v.isAvailable,
                      sortOrder: v.sortOrder,
                    };
                  }),
                }
              : undefined,
          addOnGroups:
            data.addOnGroups.length > 0
              ? {
                  create: data.addOnGroups.map((g) => {
                    return {
                      name: g.name,
                      selection: g.selection,
                      minSelect: g.minSelect,
                      maxSelect: g.maxSelect ?? null,
                      sortOrder: g.sortOrder,
                      addOns: {
                        create: g.addOns.map((a) => {
                          return {
                            name: a.name,
                            price: a.price,
                            isAvailable: a.isAvailable,
                            sortOrder: a.sortOrder,
                          };
                        }),
                      },
                    };
                  }),
                }
              : undefined,
        },
      });

      revalidatePath("/dashboard/menu");
    });

    return { ok: true, message: "Menu item created." };
  } catch (error: any) {
    // Prisma unique constraint (slug unique per category)
    if (error?.code === "P2002") {
      return { ok: false, message: "Slug already exists in this category." };
    }

    return { ok: false, message: "Failed to create menu item." };
  }
};
