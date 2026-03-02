"use client";

import MenuItemCard from "@/components/dashboard/menu/menuItem/MenuItemCard";
import MenuItemForm from "@/components/dashboard/menu/menuItem/MenuItemForm";
import { ResponsiveModal } from "@/components/global/ResponsiveModal";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { MenuItemCardSelect } from "@/lib/types/MenuItemCards";
import { cn } from "@/lib/utils";
import { AddOnGroup, ItemVariant, MenuItem } from "@prisma/client";
import { FC, useState } from "react";

interface MenuItemDisplayProps {
  menuItems: MenuItemCardSelect[];
  categoryId: string;
}

function moneyRange(item: any) {
  // prices are Decimal (dollars)
  if (item.priceType === "SIMPLE") {
    return item.basePrice != null ? `$${item.basePrice}` : "—";
  }
  const prices = (item.variants ?? [])
    .filter((v: any) => v.isAvailable)
    .map((v: any) => Number(v.price));

  if (!prices.length) return "No variants";
  const min = Math.min(...prices).toFixed(2);
  const max = Math.max(...prices).toFixed(2);
  return min === max ? `$${min}` : `$${min} – $${max}`;
}

function addOnSummary(item: any) {
  const groups = item.addOnGroups?.length ?? 0;
  const addOns =
    item.addOnGroups?.reduce(
      (acc: number, g: any) => acc + (g.addOns?.length ?? 0),
      0,
    ) ?? 0;

  if (!groups) return "No add-ons";
  return `${groups} group${groups > 1 ? "s" : ""} • ${addOns} add-on${addOns > 1 ? "s" : ""}`;
}

const MenuItemDisplay: FC<MenuItemDisplayProps> = ({
  menuItems,
  categoryId,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {menuItems.map((item) => {
        const price = moneyRange(item);
        const addOns = addOnSummary(item);

        return (
          <MenuItemCard key={item.id} item={item} categoryId={categoryId} />
        );
      })}
    </div>
  );
};

export default MenuItemDisplay;
