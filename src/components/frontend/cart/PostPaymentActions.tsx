"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart.store";

export default function PostPaymentActions({
  paid,
  redirectTo = "/orders",
  delayMs = 1500,
}: {
  paid: boolean;
  redirectTo?: string;
  delayMs?: number;
}) {
  const router = useRouter();

  const clear = useCartStore((s) => s.clear);
  const clearDetails = useCartStore((s) => (s as any).clearDetails) as
    | (() => void)
    | undefined;

  const didRun = React.useRef(false);

  React.useEffect(() => {
    if (!paid) return;
    if (didRun.current) return;

    didRun.current = true;

    // ✅ Clear cart + checkout details
    clear();
    clearDetails?.();

    // ✅ Redirect after a short delay (lets user see confirmation + confetti)
    const t = setTimeout(() => {
      router.replace(redirectTo);
      router.refresh();
    }, delayMs);

    return () => clearTimeout(t);
  }, [paid, clear, clearDetails, router, redirectTo, delayMs]);

  return null;
}
