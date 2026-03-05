import { headers } from "next/headers";
import { auth } from "../auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "../prisma/db";

export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  if (session.user.email === "feneelp@gmail.com") {
    const userAllowCheck = await prisma.allowedUser.findUnique({
      where: { email: session.user.email },
    });

    if (!userAllowCheck) {
      await prisma.allowedUser.create({
        data: {
          email: session.user.email,
          isActive: true,
          role: "ADMIN",
        },
      });
    }

    return { user: session.user };
  }
  const allowed = await prisma.allowedUser.findUnique({
    where: { email: session.user.email, isActive: true, role: "ADMIN" },
  });

  if (!allowed?.isActive) redirect("/");

  return { user: session.user };
};
