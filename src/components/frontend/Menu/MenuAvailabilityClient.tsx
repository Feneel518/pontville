// components/frontend/Menu/MenuAvailabilityClient.tsx
"use client";

import * as React from "react";
import MenuItemsList from "@/components/dashboard/menu/menuItem/MenuItemsList";

type OpenState = {
  isOpen: boolean;
  closesAt?: string;
  opensAt?: string;
};

interface MenuAvailabilityClientProps {
  menuId: string;
  initialOpen: OpenState;
  items: any[];
  categoryName: string;
  categorySlug: string;
}

export default function MenuAvailabilityClient({
  menuId,
  initialOpen,
  items,
  categoryName,
  categorySlug,
}: MenuAvailabilityClientProps) {
  const [open, setOpen] = React.useState<OpenState>(initialOpen);

  React.useEffect(() => {
    let cancelled = false;

    const fetchAvailability = async () => {
      try {
        const res = await fetch(`/api/menu/${menuId}/availability`, {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        if (!cancelled) {
          setOpen({
            isOpen: data.isOpen,
            closesAt: data.closesAt,
            opensAt: data.opensAt,
          });
        }
      } catch {}
    };

    fetchAvailability();

    const interval = setInterval(fetchAvailability, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [menuId]);

  return (
    <MenuItemsList
      open={open}
      menuId={menuId}
      items={items}
      categoryName={categoryName}
      categorySlug={categorySlug}
    />
  );
}
