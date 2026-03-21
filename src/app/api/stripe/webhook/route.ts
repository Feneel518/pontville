import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe/server";
import { prisma } from "@/lib/prisma/db";

export async function POST(req: Request) {
  const body = await req.text(); // ✅ raw text required
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  // ✅ Idempotency: ignore duplicate event deliveries
  const eventId = event.id;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;

        const orderId = session?.metadata?.orderId as string | undefined;
        if (!orderId) break;

        const paymentIntentId = session.payment_intent as string | null;

        await prisma.$transaction(async (tx) => {
          const order = await tx.order.findUnique({
            where: { id: orderId },
            select: { id: true, paymentStatus: true, lastStripeEventId: true },
          });

          if (!order) return;

          // If we already processed this event, skip
          if (order.lastStripeEventId === eventId) return;

          // If already paid, just store eventId and exit
          if (order.paymentStatus === "PAID") {
            await tx.order.update({
              where: { id: orderId },
              data: { lastStripeEventId: eventId },
            });
            return;
          }

          await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              stripePaymentIntentId: paymentIntentId ?? undefined,
              lastStripeEventId: eventId,
            },
          });
        });

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as any;
        const orderId = session?.metadata?.orderId as string | undefined;
        if (!orderId) break;

        await prisma.order
          .update({
            where: { id: orderId },
            data: {
              paymentStatus: "FAILED",
              lastStripeEventId: eventId,
            },
          })
          .catch(() => {});

        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as any;
        const paymentIntentId = pi.id as string;

        await prisma.order.updateMany({
          where: { stripePaymentIntentId: paymentIntentId },
          data: { paymentStatus: "FAILED", lastStripeEventId: eventId },
        });

        break;
      }

      default:
        // ignore other events
        break;
    }
  } catch (e) {
    // Return 500 so Stripe retries (important if DB temporarily fails)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
