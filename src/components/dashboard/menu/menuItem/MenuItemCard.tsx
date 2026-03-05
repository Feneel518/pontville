"use client";

import { ResponsiveModal } from "@/components/global/ResponsiveModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MenuItemCardSelect } from "@/lib/types/MenuItemCards";
import { cn } from "@/lib/utils";
import {
  AddOnSchemaRequest,
  ItemVariantSchemaRequest,
} from "@/lib/validators/menuItemValidator";
import { AddOnGroup, ItemVariant, MenuItem } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";
import MenuItemForm from "./MenuItemForm";

function toNumberSafe(v: unknown) {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

function formatUsd(v: string | number | null | undefined) {
  const n = toNumberSafe(v);
  if (n == null) return "—";
  return `$${n.toFixed(2).replace(/\.00$/, "")}`;
}

function getPriceLabel(item: MenuItemCardSelect) {
  if (item.priceType === "SIMPLE") return formatUsd(item.basePrice ?? null);

  const prices =
    item.variants
      ?.filter((v) => v.isAvailable)
      .map((v) => toNumberSafe(v.price))
      .filter((n): n is number => n != null) ?? [];

  if (!prices.length) return "—";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatUsd(min) : `${formatUsd(min)}–${formatUsd(max)}`;
}

function getChips(item: MenuItemCardSelect) {
  // Show up to 4 “chips” like your sample. We’ll use add-ons first.
  const addOns =
    item.addOnGroups
      ?.flatMap((g) => g.addOns ?? [])
      .filter((a) => a.isAvailable)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((a) => a.name) ?? [];

  const variants =
    item.variants
      ?.filter((v) => v.isAvailable)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((v) => v.name) ?? [];

  const merged = [...addOns, ...variants].slice(0, 4);
  return merged.length ? merged : ["No extras"];
}

interface MenuItemCardProps {
  className?: string;
  item: MenuItemCardSelect;
  categoryId: string;
}

const MenuItemCard: FC<MenuItemCardProps> = ({
  className,
  item,
  categoryId,
}) => {
  const [open, setOpen] = useState(false);
  const priceLabel = getPriceLabel(item);
  const chips = getChips(item);
  return (
    <div
      className={cn(
        "group relative w-full max-w-[360px] rounded-[28px] bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md",
        className,
      )}>
      {/* Top image panel */}
      <div className="relative m-3 overflow-hidden rounded-[22px] bg-muted">
        {/* Price tag */}
        <div className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-black shadow-sm ring-1 ring-black/5">
          {priceLabel}
        </div>
        {/* Availability / Status */}
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
            {item.status}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(!item.isAvailable && "opacity-70")}>
            {item.isAvailable ? "Available" : "Hidden"}
          </Badge>
        </div>
        <div className="relative aspect-4/3 w-full overflow-hidden">
          <Image
            src={item.imageUrl || "/placeholder.jpg"}
            alt={item.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02] rounded-[28px]  "
            sizes="(max-width: 768px) 100vw, 360px"
            priority={false}
          />
        </div>
        {/* Bottom strip inside image */}
        <div className="flex items-center truncate  justify-center bg-black/10  py-2 pt-8 -mt-6 text-xs text-black/70">
          <p className="">{item.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 ">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-xl font-semibold leading-tight">
              {item.name}
            </div>
          </div>

          <ResponsiveModal
            onOpenChange={setOpen}
            open={open}
            trigger={
              <div className="flex items-center justify-center gap-2 hover:bg-primary rounded-md p-1 cursor-pointer text-sm">
                Edit <span aria-hidden>↗</span>
              </div>
            }>
            <MenuItemForm
              categoryId={categoryId}
              mode="edit"
              setOpen={setOpen}
              initial={item}></MenuItemForm>
          </ResponsiveModal>
        </div>

        {/* Description */}
        {item.description ? (
          <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </div>
        ) : null}
        {/* Meta row: price type + counts */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {item.priceType === "VARIANT" ? (
            <Badge variant="outline">
              {item.variants?.length ?? 0} variant
              {(item.variants?.length ?? 0) === 1 ? "" : "s"}
            </Badge>
          ) : null}

          <Badge variant="outline">
            {item.addOnGroups?.length ?? 0} Add On
            {(item.addOnGroups?.length ?? 0) === 1 ? "" : "s"}
          </Badge>
        </div>

        {/* Chips like the sample */}
        <div className="mt-4 flex flex-wrap gap-2 ">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground ring-1 ring-black/5">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
