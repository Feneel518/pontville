"use client";

import { ResponsiveModal } from "@/components/global/ResponsiveModal";
import { Badge } from "@/components/ui/badge";
import { MenuItemCardSelect } from "@/lib/types/MenuItemCards";
import { cn } from "@/lib/utils";
import Image from "next/image";
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
        "group relative w-full overflow-hidden rounded-2xl sm:rounded-[28px] bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md",
        "mx-auto max-w-full sm:max-w-[420px]",
        className,
      )}>
      {/* Top image panel */}
      <div className="relative m-2 sm:m-3 overflow-hidden rounded-xl sm:rounded-[22px] bg-muted">
        {/* Price tag */}
        <div className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-2.5 py-1 text-xs sm:right-3 sm:top-3 sm:px-3 sm:text-sm font-semibold text-black shadow-sm ring-1 ring-black/5">
          {priceLabel}
        </div>

        {/* Availability / Status */}
        <div className="absolute left-2 top-2 z-10 flex max-w-[70%] flex-wrap gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
          <Badge
            variant={item.status === "ACTIVE" ? "default" : "secondary"}
            className="text-[10px] sm:text-xs">
            {item.status}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] sm:text-xs",
              !item.isAvailable && "opacity-70",
            )}>
            {item.isAvailable ? "Available" : "Hidden"}
          </Badge>
        </div>

        <div className="relative aspect-4/3 w-full overflow-hidden">
          <Image
            src={item.imageUrl || "/placeholder.jpg"}
            alt={item.name}
            fill
            className="rounded-xl sm:rounded-[22px] object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            priority={false}
          />
        </div>

        {/* Bottom strip inside image */}
        <div className="flex items-center justify-center truncate bg-black/10 py-2 pt-8 -mt-8 text-xs text-black/70">
          {/* <p>{item.name}</p> */}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 text-base font-semibold leading-tight sm:text-xl">
              {item.name}
            </div>
          </div>

          <ResponsiveModal
            onOpenChange={setOpen}
            open={open}
            trigger={
              <div className="shrink-0 rounded-md px-2 py-1 text-xs sm:text-sm font-medium cursor-pointer transition hover:bg-primary hover:text-primary-foreground">
                Edit <span aria-hidden>↗</span>
              </div>
            }>
            <MenuItemForm
              categoryId={categoryId}
              mode="edit"
              setOpen={setOpen}
              initial={item}
            />
          </ResponsiveModal>
        </div>

        {/* Description */}
        {item.description ? (
          <div className="mt-2 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {item.description}
          </div>
        ) : null}

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap gap-2">
          {item.priceType === "VARIANT" ? (
            <Badge variant="outline" className="text-[10px] sm:text-xs">
              {item.variants?.length ?? 0} variant
              {(item.variants?.length ?? 0) === 1 ? "" : "s"}
            </Badge>
          ) : null}

          <Badge variant="outline" className="text-[10px] sm:text-xs">
            {item.addOnGroups?.length ?? 0} Add On
            {(item.addOnGroups?.length ?? 0) === 1 ? "" : "s"}
          </Badge>
        </div>

        {/* Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span
              key={c}
              className="max-w-full rounded-full bg-muted px-3 py-1 text-[10px] sm:text-xs text-muted-foreground ring-1 ring-black/5">
              <span className="block max-w-[140px] truncate sm:max-w-[180px]">
                {c}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
