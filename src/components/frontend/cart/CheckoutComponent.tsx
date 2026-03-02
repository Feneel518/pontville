"use client";

import * as React from "react";
import { useCartStore } from "@/lib/store/cart.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import SectionComponent from "@/components/global/SectionComponent";
import { useSession } from "@/lib/auth/authClient";
import { useRouter } from "next/navigation";

export default function CheckoutComponent({
  user,
}: {
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    role: "USER" | "ADMIN" | "STAFF" | "OWNER" | "MANAGER";
  };
}) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);

  if (items.length === 0) {
    toast.error("The cart is empty, please add some items to continue.");

    router.push("/menu");
  }

  const details = useCartStore((s) => (s as any).details) as {
    customerName: string;
    customerPhone: string;
    pickupTime?: string;
    notes?: string;
  };

  const setDetails = useCartStore((s) => (s as any).setDetails) as (
    patch: Partial<typeof details>,
  ) => void;

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;

    // Only set defaults if fields are empty
    if (!details.customerName && user.name) {
      setDetails({ customerName: user.name });
    }

    // If you later store phone in user table, you can do:
    // if (!details.customerPhone && user.phone) {
    //   setDetails({ customerPhone: user.phone });
    // }
  }, [user]);

  React.useEffect(() => {
    const now = new Date();

    if (details.pickupTime) {
      const existing = new Date(details.pickupTime);
      if (existing > now) return; // keep valid future time
    }

    now.setMinutes(now.getMinutes() + 30);

    const minutes = now.getMinutes();
    const remainder = minutes % 15;

    if (remainder !== 0) {
      now.setMinutes(minutes + (15 - remainder));
    }

    now.setSeconds(0);
    now.setMilliseconds(0);

    const isoLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setDetails({ pickupTime: isoLocal });
  }, []);

  // ⚠️ You must know restaurantId here.
  // If your cart has items with menuId -> restaurant can be derived server-side,
  // but simplest: pass restaurantId from your public menu route and store it in cart.

  async function payNow() {
    if (!items.length) {
      toast.error("Cart is empty");
      return;
    }
    if (!details.customerName?.trim()) {
      toast.error("Enter your name");
      return;
    }
    if (!details.customerPhone?.trim()) {
      toast.error("Enter your phone");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: details.customerName,
          customerPhone: details.customerPhone,
          pickupTime: details.pickupTime || undefined,
          notes: details.notes || undefined,
          items: items.map((line) => ({
            menuItemId: line.menuItemId,
            variantId: line.variant?.id ?? line.variant?.id ?? null, // depends how you store it
            quantity: line.quantity,
            addOnIds: (line.addOns ?? []).map((a: any) => a.id),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Checkout failed", { description: data.error || "" });
        return;
      }

      window.location.href = data.url;
    } catch (e) {
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionComponent className="max-w-2xl mx-auto">
      <Card className="">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Name</div>
            <Input
              value={details.customerName}
              onChange={(e) => setDetails({ customerName: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Phone</div>
            <Input
              value={details.customerPhone}
              onChange={(e) => setDetails({ customerPhone: e.target.value })}
              placeholder="04xx xxx xxx"
            />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Pickup time (optional)</div>
            {/* easiest: datetime-local */}
            <Input
              type="datetime-local"
              step={900}
              value={details.pickupTime || ""}
              onChange={(e) => setDetails({ pickupTime: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              If empty, we’ll treat it as ASAP.
            </p>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Notes (optional)</div>
            <Textarea
              value={details.notes || ""}
              onChange={(e) => setDetails({ notes: e.target.value })}
              placeholder="No onions, extra spicy, etc."
            />
          </div>

          <Button
            className="w-full rounded-xl"
            onClick={payNow}
            disabled={loading}>
            {loading ? "Redirecting..." : "Pay Now"}
          </Button>
        </CardContent>
      </Card>
    </SectionComponent>
  );
}
