"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type MenuOpenStatus = {
  isOpen: boolean;
  closesAt?: string;
  opensAt?: string;
  nextChangeAt?: string;
};

export function useMenuOpenStatus(
  menuId: string,
  initialStatus: MenuOpenStatus,
) {
  const [status, setStatus] = useState<MenuOpenStatus>(initialStatus);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/menu/${menuId}/status`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = (await res.json()) as MenuOpenStatus;
      setStatus(data);
    } catch (error) {
      console.error("Failed to refresh menu status", error);
    }
  }, [menuId]);

  const msUntilNextChange = useMemo(() => {
    if (!status.nextChangeAt) return null;
    const diff = new Date(status.nextChangeAt).getTime() - Date.now();
    return Math.max(diff + 1000, 1000);
  }, [status.nextChangeAt]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (msUntilNextChange != null) {
      timeoutRef.current = setTimeout(() => {
        refresh();
      }, msUntilNextChange);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [msUntilNextChange, refresh]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      refresh();
    }, 60_000);

    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  return {
    status,
    refresh,
  };
}
