import MenuItemsSection from "@/components/frontend/Menu/MenuItemSection";
import { type MenuOpenStatus } from "@/hooks/useMenuOpenStatus";
import { Weekday } from "@/lib/helpers/WeekDaysHelpers";
import { OpeningHour } from "@/lib/menuChecks/menuAvailability";

interface MenuItemsSectionLiveProps {
  menuId: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  initialOpen: MenuOpenStatus;
  openingHours: OpeningHour[];
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
  return (
    <MenuItemsSection
      initialOpen={initialOpen}
      openingHours={openingHours}
      timezone={timezone}
      menuId={menuId}
      categoryId={categoryId}
      categoryName={categoryName}
      categorySlug={categorySlug}
    />
  );
}
