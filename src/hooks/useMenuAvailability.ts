// lib/hooks/useMenuAvailability.ts
"use client";

import * as React from "react";

type MenuAvailability = {
  isOpen: boolean;
  opensAt?: string;
  closesAt?: string;
};

export function useMenuAvailability(
  menuId: string,
  initialData: MenuAvailability,
) {
  const [data, setData] = React.useState<MenuAvailability>(initialData);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/menu/${menuId}/availability`, {
          cache: "no-store",
        });

        if (!res.ok) return;

        const json = await res.json();
        if (!mounted) return;

        setData({
          isOpen: json.isOpen,
          opensAt: json.opensAt,
          closesAt: json.closesAt,
        });
      } catch {
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAvailability();

    const interval = setInterval(fetchAvailability, 30_000); // 30 sec
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [menuId]);

  return { ...data, loading };
}
