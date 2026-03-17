// components/frontend/Menu/MenuAvailabilityBoundary.tsx
"use client";

import { useMenuAvailability } from "@/hooks/useMenuAvailability";
import React from "react";

type OpenState = {
  isOpen: boolean;
  opensAt?: string;
  closesAt?: string;
};

export default function MenuAvailabilityBoundary({
  menuId,
  initialOpen,
  children,
}: {
  menuId: string;
  initialOpen: OpenState;
  children: (open: OpenState) => React.ReactNode;
}) {
  const open = useMenuAvailability(menuId, initialOpen);

  return <>{children(open)}</>;
}
