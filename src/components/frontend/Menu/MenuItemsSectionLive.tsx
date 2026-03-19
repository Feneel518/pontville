"use client";

import MenuItemsSection from "@/components/frontend/Menu/MenuItemSection";
import {
  useMenuOpenStatus,
  type MenuOpenStatus,
} from "@/hooks/useMenuOpenStatus";

interface MenuItemsSectionLiveProps {
  menuId: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  initialOpen: MenuOpenStatus;
}

export default function MenuItemsSectionLive({
  menuId,
  categoryId,
  categoryName,
  categorySlug,
  initialOpen,
}: MenuItemsSectionLiveProps) {
  const { status } = useMenuOpenStatus(menuId, initialOpen);

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
