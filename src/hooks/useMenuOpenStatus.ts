"use client";

import { useEffect, useMemo, useState } from "react";
import { MenuAvailabilityState } from "@/lib/types/menuAvailability";
import { getMenuAvailability } from "@/components/frontend/Menu/MenuAvailability";
import { Weekday } from "@/lib/helpers/WeekDaysHelpers";

type OpeningHourInput = {
  day: Weekday;
  isClosed?: boolean | null;
  openTime?: string | null;
  closeTime?: string | null;
};

type UseMenuOpenStatusArgs = {
  openingHours: OpeningHourInput[];
  initialStatus: MenuAvailabilityState;
  timezone?: string;
};

export function useMenuOpenStatus({
  openingHours,
  initialStatus,
  timezone = "Australia/Hobart",
}: UseMenuOpenStatusArgs) {
  const [status, setStatus] = useState<MenuAvailabilityState>(initialStatus);



  const nextChangeMs = useMemo(() => {
    if (!status.nextChangeAt) return null;
    const next = new Date(status.nextChangeAt).getTime();

    const now = Date.now();
    const diff = next - now;
    return diff > 0 ? diff : 0;
  }, [status.nextChangeAt]);

  useEffect(() => {
    if (nextChangeMs == null) return;

    const timeout = window.setTimeout(
      () => {
        const fresh = getMenuAvailability({
          openingHours,
          now: new Date(),
          timezone,
        });

        setStatus(fresh);
      },
      Math.min(nextChangeMs + 1000, 2_147_483_647),
    );

    return () => window.clearTimeout(timeout);
  }, [nextChangeMs, openingHours, timezone]);

  return { status };
}

export type MenuOpenStatus = MenuAvailabilityState;
