// "use client";

// import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// export type MenuAvailabilityState = {
//   isOpen: boolean;
//   message: string;
//   opensAt: string | null;
//   closesAt: string | null;
//   nextChangeAt: string | null;
//   timezone: string;
// };

// export function useMenuAvailability(
//   menuId: string,
//   initial: MenuAvailabilityState,
// ) {
//   const [state, setState] = useState<MenuAvailabilityState>(initial);
//   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const refresh = useCallback(async () => {
//     try {
//       const res = await fetch(`/api/menu/${menuId}/availability`, {
//         method: "GET",
//         cache: "no-store",
//       });

//       if (!res.ok) return;

//       const json = (await res.json()) as MenuAvailabilityState;
//       setState(json);
//     } catch (error) {
//       console.error("Failed to refresh menu availability", error);
//     }
//   }, [menuId]);

//   const msUntilNextChange = useMemo(() => {
//     if (!state.nextChangeAt) return null;

//     const diff = new Date(state.nextChangeAt).getTime() - Date.now();

//     // add slight buffer so we refresh after actual change moment
//     return Math.max(diff + 1000, 1000);
//   }, [state.nextChangeAt]);

//   useEffect(() => {
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);

//     if (msUntilNextChange != null) {
//       timeoutRef.current = setTimeout(() => {
//         refresh();
//       }, msUntilNextChange);
//     }

//     return () => {
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     };
//   }, [msUntilNextChange, refresh]);

//   useEffect(() => {
//     // Fallback: periodic safety refresh every 60 sec
//     pollRef.current = setInterval(() => {
//       refresh();
//     }, 60_000);

//     const onVisibility = () => {
//       if (document.visibilityState === "visible") {
//         refresh();
//       }
//     };

//     const onFocus = () => refresh();

//     document.addEventListener("visibilitychange", onVisibility);
//     window.addEventListener("focus", onFocus);

//     return () => {
//       if (pollRef.current) clearInterval(pollRef.current);
//       document.removeEventListener("visibilitychange", onVisibility);
//       window.removeEventListener("focus", onFocus);
//     };
//   }, [refresh]);

//   return {
//     ...state,
//     refresh,
//   };
// }

"use client";

import { useEffect, useState } from "react";
import {
  getMenuAvailabilityNew,
  OpeningHour,
} from "@/lib/menuChecks/menuAvailability";
import { MenuAvailabilityState } from "@/lib/types/menuAvailability";

type UseMenuAvailabilityArgs = {
  openingHours: OpeningHour[];
  timezone: string;
  initialAvailability: MenuAvailabilityState;
};

export function useMenuAvailability({
  openingHours,
  timezone,
  initialAvailability,
}: UseMenuAvailabilityArgs) {
  const [availability, setAvailability] =
    useState<MenuAvailabilityState>(initialAvailability);

  console.log({ availability });

  useEffect(() => {
    const updateAvailability = () => {
      const next = getMenuAvailabilityNew(openingHours, timezone);
      setAvailability((prev) => {
        const hasStateChanged = prev.isOpen !== next.isOpen;

        return {
          ...next,
          lastChangedAt: hasStateChanged ? Date.now() : prev.lastChangedAt,
        };
      });
    };

    updateAvailability();

    const interval = setInterval(updateAvailability, 15000);

    return () => clearInterval(interval);
  }, [openingHours, timezone]);

  return availability;
}
