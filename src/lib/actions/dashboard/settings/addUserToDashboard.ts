"use server";

import { requireAuth } from "@/lib/checks/requireAuth";
import { fail, success } from "@/lib/helpers/ActionResultHelper";
import { prisma } from "@/lib/prisma/db";
import {
  allowedUSerSchema,
  AllowedUserSchemaRequest,
} from "@/lib/validators/AllowedUserSchema";
import { revalidatePath } from "next/cache";

export const addUserToDashboard = async (value: AllowedUserSchemaRequest) => {
  await requireAuth();

  const parsed = allowedUSerSchema.safeParse(value);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid");
  }

  const data = parsed.data;
  const created = await prisma.allowedUser.upsert({
    where: { email: data.email },
    create: { email: data.email, isActive: true, role: "ADMIN" },
    update: { isActive: true }, // re-activate if existed
  });

  revalidatePath("/dashboard/settings");
  return created;
};

export async function toggleAllowedUserActiveAction(id: string) {
  await requireAuth();

  const u = await prisma.allowedUser.findUnique({ where: { id } });
  if (!u) throw new Error("User not found");

  const updated = await prisma.allowedUser.update({
    where: { id },
    data: { isActive: !u.isActive },
  });

  revalidatePath("/dashboard/settings");
  return updated;
}

export async function removeAllowedUserAction(id: string) {
  await requireAuth();

  await prisma.allowedUser.delete({ where: { id } });

  revalidatePath("/dashboard/settings");
}
