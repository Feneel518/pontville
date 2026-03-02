"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";
import {
  MenuItemSchema,
  MenuItemSchemaRequest,
} from "@/lib/validators/menuItemValidator";
import { revalidatePath } from "next/cache";

export const updateMenuItemAction = async (values: MenuItemSchemaRequest) => {
  await requireAuth();

  const parsed = MenuItemSchema.safeParse(values);

  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid data",
    };
  const data = parsed.data;

  if (!data.id) return { ok: false, message: "Missing menu item id." };

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.menuItem.findUnique({
        where: { id: data.id },
        include: {
          variants: true,
          addOnGroups: {
            include: { addOns: true },
          },
        },
      });

      if (!existing)
        return {
          ok: false,
          message: "Menu item not found in teh database so cannot update.",
        };

      // 1) Update base menu item fields
      await tx.menuItem.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          imageUrl: data.imageUrl || null,

          priceType: data.priceType,
          basePrice: data.priceType === "SIMPLE" ? data.basePrice : null,

          status: data.status,
          isAvailable: data.isAvailable,
          sortOrder: data.sortOrder,
          isVeg: data.isVeg,
          isVegan: data.isVegan,
        },
      });

      // 2) Variants handling
      // Rule: SIMPLE => no variants
      if (data.priceType === "SIMPLE") {
        if (existing.variants.length) {
          await tx.itemVariant.deleteMany({
            where: { menuItemId: existing.id },
          });
        }
      } else {
        // VARIANT => upsert variants
        const incoming = data.variants;

        const incomingIds = new Set(
          incoming.map((v) => v.id).filter(Boolean) as string[],
        );
        const existingIds = new Set(existing.variants.map((v) => v.id));

        // delete removed variants
        const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
        if (toDelete.length) {
          await tx.itemVariant.deleteMany({ where: { id: { in: toDelete } } });
        }

        // upsert (update existing / create new)
        for (const v of incoming) {
          if (v.id && existingIds.has(v.id)) {
            await tx.itemVariant.update({
              where: { id: v.id },
              data: {
                name: v.name,
                price: v.price,
                isAvailable: v.isAvailable,
                sortOrder: v.sortOrder,
              },
            });
          } else {
            await tx.itemVariant.create({
              data: {
                menuItemId: existing.id,
                name: v.name,
                price: v.price,
                isAvailable: v.isAvailable,
                sortOrder: v.sortOrder,
              },
            });
          }
        }
      }

      // 3) Add-on groups + add-ons handling (diff + upsert)
      const incomingGroups = data.addOnGroups;

      const incomingGroupIds = new Set(
        incomingGroups.map((g) => g.id).filter(Boolean) as string[],
      );
      const existingGroupIds = new Set(existing.addOnGroups.map((g) => g.id));

      // delete removed groups (cascades addOns because of relation onDelete: Cascade)
      const groupsToDelete = [...existingGroupIds].filter(
        (id) => !incomingGroupIds.has(id),
      );
      if (groupsToDelete.length) {
        await tx.addOnGroup.deleteMany({
          where: { id: { in: groupsToDelete } },
        });
      }

      // upsert groups
      for (const g of incomingGroups) {
        if (g.id && existingGroupIds.has(g.id)) {
          // update group
          await tx.addOnGroup.update({
            where: { id: g.id },
            data: {
              name: g.name,
              selection: g.selection,
              minSelect: g.minSelect,
              maxSelect: g.maxSelect ?? null,
              sortOrder: g.sortOrder,
            },
          });

          // diff addOns inside group
          const existingGroup = existing.addOnGroups.find(
            (eg) => eg.id === g.id,
          )!;
          const existingAddOnIds = new Set(
            existingGroup.addOns.map((a) => a.id),
          );
          const incomingAddOnIds = new Set(
            g.addOns.map((a) => a.id).filter(Boolean) as string[],
          );

          const addOnsToDelete = [...existingAddOnIds].filter(
            (id) => !incomingAddOnIds.has(id),
          );
          if (addOnsToDelete.length) {
            await tx.addOn.deleteMany({
              where: { id: { in: addOnsToDelete } },
            });
          }

          for (const a of g.addOns) {
            if (a.id && existingAddOnIds.has(a.id)) {
              await tx.addOn.update({
                where: { id: a.id },
                data: {
                  name: a.name,
                  price: a.price,
                  isAvailable: a.isAvailable,
                  sortOrder: a.sortOrder,
                },
              });
            } else {
              await tx.addOn.create({
                data: {
                  groupId: g.id,
                  name: a.name,
                  price: a.price,
                  isAvailable: a.isAvailable,
                  sortOrder: a.sortOrder,
                },
              });
            }
          }
        } else {
          // create new group + addOns
          await tx.addOnGroup.create({
            data: {
              itemId: existing.id,
              name: g.name,
              selection: g.selection,
              minSelect: g.minSelect,
              maxSelect: g.maxSelect ?? null,
              sortOrder: g.sortOrder,
              addOns: {
                create: g.addOns.map((a) => ({
                  name: a.name,
                  price: a.price,
                  isAvailable: a.isAvailable,
                  sortOrder: a.sortOrder,
                })),
              },
            },
          });
        }
      }

      revalidatePath(`/dashboard/menus`);
    });
    return { ok: true, message: "Menu item updated." };
  } catch (e: any) {
    if (e?.message === "NOT_FOUND")
      return { ok: false, message: "Menu item not found." };
    if (e?.code === "P2002")
      return { ok: false, message: "Slug already exists in this category." };
    return { ok: false, message: "Failed to update menu item." };
  }
};
