import { prisma } from "@/lib/prisma/db";
import { stripe } from "@/lib/stripe/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getOrderYear } from "@/lib/helpers/OrderYear";

export async function POST(req: Request) {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = authSession.user.id;

  const body = (await req.json()) as {
    customerName: string;
    customerPhone: string;
    pickupTime?: string;
    notes?: string | null;
    items: {
      menuItemId: string;
      variantId?: string | null;
      quantity: number;
      addOnIds: string[];
    }[];
  };

  // 1) basic validation

  if (!body.customerName?.trim())
    return NextResponse.json(
      { error: "customerName required" },
      { status: 400 },
    );

  if (!body.customerPhone?.trim())
    return NextResponse.json(
      { error: "customerPhone required" },
      { status: 400 },
    );

  if (!Array.isArray(body.items) || body.items.length === 0)
    return NextResponse.json({ error: "items required" }, { status: 400 });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: { phone: body.customerPhone },
  });

  const restaurantId = await prisma.restaurant.findFirst({
    select: { id: true },
  });

  // 2) fetch menu items + variants + addon groups + addons
  const menuItemIds = [...new Set(body.items.map((i) => i.menuItemId))];
  const requestedAddOnIds = [
    ...new Set(body.items.flatMap((i) => i.addOnIds ?? [])),
  ];

  const [restaurant, menuItems, addOns] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: restaurantId?.id } }),
    prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, deletedAt: null, status: "ACTIVE" },
      include: {
        category: {
          include: {
            menu: { select: { name: true } },
          },
        },
        variants: true,
        addOnGroups: { include: { addOns: true } },
      },
    }),
    requestedAddOnIds.length
      ? prisma.addOn.findMany({
          where: { id: { in: requestedAddOnIds }, isAvailable: true },
          include: { group: true },
        })
      : Promise.resolve([] as any[]),
  ]);

  if (!restaurant)
    return NextResponse.json(
      { error: "Restaurant not found" },
      { status: 404 },
    );

  const menuItemById = new Map(menuItems.map((m) => [m.id, m]));
  const addOnById = new Map(addOns.map((a) => [a.id, a]));

  // 2.1) Reject any addon IDs that are unknown/unavailable
  // (Because addOns query only returned isAvailable:true)
  const unknownAddOns = requestedAddOnIds.filter((id) => !addOnById.has(id));
  if (unknownAddOns.length) {
    return NextResponse.json(
      { error: "Some add-ons are invalid or unavailable.", ids: unknownAddOns },
      { status: 400 },
    );
  }

  // 3) validate and compute totals, build snapshot rows + stripe line_items
  let subtotal = 0;
  const tax = 0;
  const packingFee = 0;

  const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const orderItemsData: any[] = [];
  const orderItemAddOnsDataByClientIndex: { [k: number]: any[] } = {};

  for (let idx = 0; idx < body.items.length; idx++) {
    const ci = body.items[idx];

    if (!ci.quantity || ci.quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const mi = menuItemById.get(ci.menuItemId);
    if (!mi) {
      return NextResponse.json(
        { error: `MenuItem not found: ${ci.menuItemId}` },
        { status: 400 },
      );
    }
    if (!mi.isAvailable) {
      return NextResponse.json(
        { error: `Item unavailable: ${mi.name}` },
        { status: 400 },
      );
    }

    // base price resolve
    let unitBasePrice = 0;
    let variantName: string | null = null;

    if (mi.priceType === "SIMPLE") {
      if (mi.basePrice == null) {
        return NextResponse.json(
          { error: `Missing basePrice for ${mi.name}` },
          { status: 400 },
        );
      }
      unitBasePrice = mi.basePrice;
    } else {
      const vid = ci.variantId ?? null;
      const v = mi.variants.find((v) => v.id === vid);

      if (!v) {
        return NextResponse.json(
          { error: `Variant required/invalid for ${mi.name}` },
          { status: 400 },
        );
      }
      if (!v.isAvailable) {
        return NextResponse.json(
          { error: `Variant unavailable: ${v.name}` },
          { status: 400 },
        );
      }
      unitBasePrice = v.price;
      variantName = v.name;
    }

    // selected addons (validated against addOnById already)
    const selectedAddOns = (ci.addOnIds ?? []).map((id) => addOnById.get(id)!);

    // ensure every selected addon belongs to this menu item groups
    const groupById = new Map(mi.addOnGroups.map((g) => [g.id, g]));
    const selectedByGroup = new Map<string, any[]>();

    for (const ao of selectedAddOns) {
      if (!groupById.has(ao.groupId)) {
        return NextResponse.json(
          { error: `Invalid addon for item: ${mi.name}` },
          { status: 400 },
        );
      }
      const arr = selectedByGroup.get(ao.groupId) ?? [];
      arr.push(ao);
      selectedByGroup.set(ao.groupId, arr);
    }

    // check group rules
    for (const g of mi.addOnGroups) {
      const picked = selectedByGroup.get(g.id) ?? [];
      const count = picked.length;

      const max = g.selection === "SINGLE" ? 1 : (g.maxSelect ?? null);

      if (count < g.minSelect) {
        return NextResponse.json(
          {
            error: `Select at least ${g.minSelect} in "${g.name}" for ${mi.name}`,
          },
          { status: 400 },
        );
      }
      if (max != null && count > max) {
        return NextResponse.json(
          { error: `Select at most ${max} in "${g.name}" for ${mi.name}` },
          { status: 400 },
        );
      }
      if (g.selection === "SINGLE" && count > 1) {
        return NextResponse.json(
          { error: `Only 1 allowed in "${g.name}" for ${mi.name}` },
          { status: 400 },
        );
      }
    }

    const unitAddOnsPrice = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    const unitTotalPrice = unitBasePrice + unitAddOnsPrice;

    if (unitTotalPrice <= 0) {
      return NextResponse.json(
        { error: `Invalid pricing for item: ${mi.name}` },
        { status: 400 },
      );
    }

    const lineTotal = unitTotalPrice * ci.quantity;
    subtotal += lineTotal;

    // DB snapshot rows
    orderItemsData.push({
      menuItemId: mi.id,
      itemVariantId: mi.priceType === "VARIANT" ? (ci.variantId ?? null) : null,
      quantity: ci.quantity,

      snapshotMenuName: mi.category.menu.name ?? "",
      snapshotCategoryName: mi.category.name,
      snapshotItemName: mi.name,
      snapshotVariantName: variantName,
      snapshotMenuId: mi.category.menuId,

      unitBasePrice,
      unitAddOnsPrice,
      unitTotalPrice,
      lineTotal,
    });

    orderItemAddOnsDataByClientIndex[idx] = selectedAddOns.map((a) => ({
      addOnId: a.id,
      snapshotGroupName: a.group.name,
      snapshotAddOnName: a.name,
      price: a.price,
    }));

    // Stripe line item
    const title = variantName ? `${mi.name} (${variantName})` : mi.name;
    const addOnNames = selectedAddOns.map((a) => a.name);

    const desc =
      addOnNames.length > 0
        ? `Add-ons: ${addOnNames.slice(0, 6).join(", ")}${addOnNames.length > 6 ? "…" : ""}`
        : undefined;

    const img =
      mi.imageUrl && mi.imageUrl.startsWith("http") ? mi.imageUrl : undefined;

    stripeLineItems.push({
      quantity: ci.quantity,
      price_data: {
        currency: "aud",
        unit_amount: unitTotalPrice * 100,
        product_data: {
          name: title,
          ...(desc ? { description: desc } : {}),
          ...(img ? { images: [img] } : {}),
        },
      },
    });
  }

  const total = subtotal + tax + packingFee;

  if (stripeLineItems.length === 0) {
    return NextResponse.json({ error: "Empty checkout" }, { status: 400 });
  }
  if (total <= 0) {
    return NextResponse.json({ error: "Invalid total" }, { status: 400 });
  }

  // 4) Create Order in DB (transaction) with retry for orderNo unique collision
  const createOrderWithRetry = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await prisma.$transaction(async (tx) => {
          const last = await tx.order.findFirst({
            where: { restaurantId: restaurant.id },
            orderBy: { orderNo: "desc" },
            select: { orderNo: true },
          });
          const nextOrderNo = (last?.orderNo ?? 0) + 1;

          const orderYear = getOrderYear();

          return await tx.order.create({
            data: {
              userId: userId,
              orderYear: orderYear,
              restaurantId: restaurant.id,
              orderNo: nextOrderNo,
              status: "NEW",
              paymentStatus: "UNPAID",

              customerName: body.customerName.trim(),
              customerPhone: body.customerPhone.trim(),
              pickupTime: body.pickupTime ? new Date(body.pickupTime) : null,
              notes: body.notes ?? null,

              subtotal,
              tax,
              packingFee,
              total,

              items: {
                create: orderItemsData.map((oi, i) => ({
                  ...oi,
                  addOns: { create: orderItemAddOnsDataByClientIndex[i] ?? [] },
                })),
              },
            },
            select: { id: true, orderNo: true, restaurantId: true },
          });
        });
      } catch (e) {
        // unique violation on (restaurantId, orderNo) -> retry
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          continue;
        }
        throw e;
      }
    }
    throw new Error("Failed to allocate orderNo after retries");
  };

  const order = await createOrderWithRetry();

  // 5) Create Stripe Checkout Session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/takeaway/success?orderId=${order.id}`,
    cancel_url: `${appUrl}/takeaway/cancel?orderId=${order.id}`,
    metadata: {
      orderId: order.id,
      restaurantId: restaurant.id,
    },
    customer_creation: "if_required",
    line_items: stripeLineItems,
  });

  // 6) Save session id
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return NextResponse.json({ url: session.url, orderId: order.id });
}
