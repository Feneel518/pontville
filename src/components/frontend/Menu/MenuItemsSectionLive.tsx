import MenuItemsSection from "@/components/frontend/Menu/MenuItemSection";
import {
  useMenuOpenStatus,
  type MenuOpenStatus,
} from "@/hooks/useMenuOpenStatus";
import { Weekday } from "@/lib/helpers/WeekDaysHelpers";

type OpeningHourInput = {
  day: Weekday;
  isClosed?: boolean | null;
  openTime?: string | null;
  closeTime?: string | null;
};
interface MenuItemsSectionLiveProps {
  menuId: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  initialOpen: MenuOpenStatus;
  openingHours: OpeningHourInput[];
  timezone: string;
}

export default function MenuItemsSectionLive({
  menuId,
  categoryId,
  categoryName,
  categorySlug,
  initialOpen,
  openingHours,
  timezone,
}: MenuItemsSectionLiveProps) {
  const { status } = useMenuOpenStatus({
    openingHours,
    initialStatus: initialOpen,
    timezone,
  });

  return (
    <MenuItemsSection
      open={status}
      menuId={menuId}
      categoryId={categoryId}
      categoryName={categoryName}
      categorySlug={categorySlug}
    />
  );
}
