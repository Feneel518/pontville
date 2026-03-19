import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/db";
import { isMenuOpenNow } from "@/lib/checks/isMenuOpenNow";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const menu = await prisma.menu.findUnique({
      where: { id },
      select: {
        id: true,
        openingHours: true,
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const open = isMenuOpenNow({
      openingHours: menu.openingHours,
      now: new Date(),
    });

    return NextResponse.json(open, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("menu status route error", error);
    return NextResponse.json(
      { error: "Failed to get menu status" },
      { status: 500 },
    );
  }
}
