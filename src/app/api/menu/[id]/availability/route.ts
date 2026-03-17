// app/api/menu/[id]/availability/route.ts
import { prisma } from "@/lib/prisma/db";
import { isMenuOpenNow } from "@/lib/checks/isMenuOpenNow";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const menu = await prisma.menu.findUnique({
    where: { id },
    select: {
      id: true,
      openingHours: true,
      status: true,
    },
  });

  if (!menu || menu.status !== "ACTIVE") {
    return NextResponse.json(
      {
        ok: false,
        isOpen: false,
        opensAt: undefined,
        closesAt: undefined,
      },
      { status: 404 },
    );
  }

  const open = isMenuOpenNow({
    openingHours: menu.openingHours as any,
    now: new Date(),
  });

  return NextResponse.json({
    ok: true,
    ...open,
    serverTime: new Date().toISOString(),
  });
}
