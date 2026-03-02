"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import useCursorStore from "@/hooks/useCursorStore";

export function CursorRouteReset() {
  const pathname = usePathname();
  const setCursor = useCursorStore((s) => s.setCursor);

  useEffect(() => {
    // every route change => reset cursor state
    setCursor({ label: null, type: "default" });
  }, [pathname, setCursor]);

  return null;
}
