"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { FC } from "react";
import AddToCartButton from "../cart/AddToCartButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { isMenuOpenNow } from "@/lib/checks/isMenuOpenNow";
import {
  FullMenuItemCardSelect,
  MenuItemCardSelect,
} from "@/lib/types/FullMenu";
import { formatUsd } from "@/lib/helpers/formatCurrency";

type MenuOpenState = {
  isOpen: boolean;
  closesAt?: string;
  opensAt?: string;
};

interface FullMenuItemCardFrontendProps {
  item: MenuItemCardSelect | FullMenuItemCardSelect;
  categorySlug?: string;
  menuId?: string;
  open?: MenuOpenState;
  showMeta?: boolean;
}
function toNumberSafe(v: unknown) {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

function getPriceLabel(item: MenuItemCardSelect | FullMenuItemCardSelect) {
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

function hasCategoryAndMenu(
  item: MenuItemCardSelect | FullMenuItemCardSelect,
): item is FullMenuItemCardSelect {
  return "category" in item && !!item.category?.menu;
}

const FullMenuItemCardFrontend: FC<FullMenuItemCardFrontendProps> = ({
  item,
  categorySlug,
  menuId,
  open,
  showMeta,
}) => {
  const hasVariants = item.priceType === "VARIANT" && item.variants.length > 0;

  const derivedMenuId = hasCategoryAndMenu(item)
    ? item.category.menu.id
    : menuId;
  const derivedCategorySlug = hasCategoryAndMenu(item)
    ? item.category.slug
    : categorySlug;

  const derivedOpen =
    open ??
    (hasCategoryAndMenu(item)
      ? isMenuOpenNow({
          openingHours: item.category.menu.openingHours,
          now: new Date(),
        })
      : { isOpen: false });

  const defaultVariantId = React.useMemo(() => {
    if (!hasVariants) return undefined;
    const available = item.variants.filter((v) => v.isAvailable);
    const sorted = [...available].sort((a, b) => a.price - b.price);
    return sorted[0]?.id;
  }, [hasVariants, item.variants]);

  const [variantId, setVariantId] = React.useState<string | undefined>(
    defaultVariantId,
  );

  React.useEffect(() => {
    setVariantId(defaultVariantId);
  }, [defaultVariantId]);

  const selectedVariant = React.useMemo(() => {
    if (!hasVariants) return undefined;
    return item.variants.find((v) => v.id === variantId);
  }, [hasVariants, item.variants, variantId]);

  const unitBasePricePaise = React.useMemo(() => {
    if (item.priceType === "SIMPLE") return item.basePrice ?? 0;
    if (!selectedVariant) return 0;
    return selectedVariant.price;
  }, [item.basePrice, item.priceType, selectedVariant]);

  function clampMulti(ids: string[], maxSelect: number | null | undefined) {
    if (maxSelect == null) return ids;
    if (ids.length <= maxSelect) return ids;
    return ids.slice(ids.length - maxSelect);
  }

  const groups = item.addOnGroups ?? [];
  const [selectedByGroup, setSelectedByGroup] = React.useState<
    Record<string, string[]>
  >({});

  function toggleAddOn(groupId: string, addOnId: string) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    setSelectedByGroup((prev) => {
      const current = prev[groupId] ?? [];

      if (group.selection === "SINGLE") {
        const isSame = current.length === 1 && current[0] === addOnId;
        if (isSame && (group.minSelect ?? 0) === 0) {
          return { ...prev, [groupId]: [] };
        }
        return { ...prev, [groupId]: [addOnId] };
      }

      const exists = current.includes(addOnId);
      const next = exists
        ? current.filter((x) => x !== addOnId)
        : [...current, addOnId];

      return { ...prev, [groupId]: clampMulti(next, group.maxSelect) };
    });
  }

  const selectedAddOns = React.useMemo(() => {
    const list: {
      id: string;
      name: string;
      price: number;
      groupId?: string;
      groupName?: string;
    }[] = [];

    for (const g of groups) {
      const selectedIds = selectedByGroup[g.id] ?? [];
      for (const addOnId of selectedIds) {
        const addOn = g.addOns.find((a) => a.id === addOnId);
        if (!addOn) continue;
        list.push({
          id: addOn.id,
          name: addOn.name,
          price: addOn.price,
          groupId: g.id,
          groupName: g.name,
        });
      }
    }

    return list;
  }, [groups, selectedByGroup]);

  return (
    <div className="group relative flex h-full w-full flex-col justify-between space-y-3 rounded-4xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="relative aspect-4/3 w-full overflow-hidden">
            <Image
              src={item.imageUrl || "/placeholder.jpg"}
              alt={item.name}
              fill
              className="rounded-[28px] object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 360px"
            />
          </div>

          <div className="absolute right-3 top-3 z-10 rounded-full text-sm font-semibold">
            {item.isVegan ? (
              <Badge className="rounded-full border border-emerald-500/40 bg-emerald-500 text-white">
                Vegan
              </Badge>
            ) : null}
            {!item.isVegan && item.isVeg ? (
              <Badge className="rounded-full border border-emerald-500/40 bg-emerald-500/50 text-white">
                Veg
              </Badge>
            ) : null}
            {!item.isVeg && !item.isVegan ? (
              <Badge className="rounded-full border border-rose-500/40 bg-rose-500/50 text-white">
                Non-veg
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center justify-center truncate bg-black/10 py-2 pt-8 -mt-6 text-xs text-black/70">
            <p>{item.name}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 w-full">
              <div className="flex w-full items-start justify-between gap-8 font-serif text-xl">
                <h3>{item.name}</h3>
                <h3 className="text-3xl">{formatUsd(unitBasePricePaise)}</h3>
              </div>

              {showMeta && hasCategoryAndMenu(item) ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{item.category.menu.name}</Badge>
                  <Badge variant="outline">{item.category.name}</Badge>
                  <Badge variant={derivedOpen.isOpen ? "default" : "secondary"}>
                    {derivedOpen.isOpen
                      ? `Open now${derivedOpen.closesAt ? ` · till ${derivedOpen.closesAt}` : ""}`
                      : derivedOpen.opensAt
                        ? `Opens at ${derivedOpen.opensAt}`
                        : "Closed"}
                  </Badge>
                </div>
              ) : null}

              {item.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {hasVariants || groups.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="customize" className="border-none">
              <AccordionTrigger className="rounded-xl border bg-muted/30 px-3 py-2 text-sm font-medium hover:no-underline">
                Customize
              </AccordionTrigger>

              <AccordionContent className="space-y-4 pt-3">
                {hasVariants ? (
                  <div className="rounded-xl border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-medium">Choose variant</div>
                      {!selectedVariant ? (
                        <Badge variant="destructive" className="rounded-full">
                          Required
                        </Badge>
                      ) : null}
                    </div>

                    <RadioGroup
                      value={variantId}
                      onValueChange={setVariantId}
                      className="grid grid-cols-2 gap-2">
                      {item.variants
                        .filter((v) => v.isAvailable)
                        .map((v) => (
                          <Label
                            key={v.id}
                            htmlFor={`variant-${item.id}-${v.id}`}
                            className={cn(
                              "flex cursor-pointer items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm",
                              variantId === v.id && "border-primary",
                            )}>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                id={`variant-${item.id}-${v.id}`}
                                value={v.id}
                              />
                              <span>{v.name}</span>
                            </div>
                            <span className="font-medium">
                              {formatUsd(v.price)}
                            </span>
                          </Label>
                        ))}
                    </RadioGroup>
                  </div>
                ) : null}

                {groups.length > 0 ? (
                  <div className="space-y-4">
                    {groups.map((g) => {
                      const selectedIds = selectedByGroup[g.id] ?? [];
                      const max = g.selection === "SINGLE" ? 1 : g.maxSelect;

                      return (
                        <div
                          key={g.id}
                          className="space-y-3 rounded-2xl border bg-muted/30 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold">
                                {g.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {g.selection === "SINGLE"
                                  ? "Choose 1"
                                  : "Choose multiple"}
                                {g.minSelect > 0 ? ` • min ${g.minSelect}` : ""}
                                {max != null ? ` • max ${max}` : ""}
                              </div>
                            </div>

                            {selectedIds.length > 0 ? (
                              <Badge
                                variant="secondary"
                                className="rounded-full">
                                {selectedIds.length} selected
                              </Badge>
                            ) : null}
                          </div>

                          {g.selection === "SINGLE" ? (
                            <RadioGroup
                              value={selectedIds[0] ?? ""}
                              onValueChange={(value) =>
                                toggleAddOn(g.id, value)
                              }
                              className="grid gap-2">
                              {g.addOns
                                .filter((a) => a.isAvailable)
                                .map((a) => (
                                  <Label
                                    key={a.id}
                                    htmlFor={`addon-${g.id}-${a.id}`}
                                    className={cn(
                                      "flex cursor-pointer items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm",
                                      selectedIds.includes(a.id) &&
                                        "border-primary",
                                    )}>
                                    <div className="flex items-center gap-2">
                                      <RadioGroupItem
                                        id={`addon-${g.id}-${a.id}`}
                                        value={a.id}
                                      />
                                      <span>{a.name}</span>
                                    </div>

                                    <span className="font-medium">
                                      {formatUsd(a.price)}
                                    </span>
                                  </Label>
                                ))}
                            </RadioGroup>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {g.addOns
                                .filter((a) => a.isAvailable)
                                .map((a) => {
                                  const checked = selectedIds.includes(a.id);
                                  return (
                                    <Label
                                      key={a.id}
                                      htmlFor={`addon-${g.id}-${a.id}`}
                                      className={cn(
                                        "flex cursor-pointer items-center justify-between rounded-lg border bg-background p-2 text-sm",
                                        checked && "border-primary",
                                      )}>
                                      <div className="flex items-center gap-2">
                                        <Checkbox
                                          id={`addon-${g.id}-${a.id}`}
                                          checked={checked}
                                          onCheckedChange={() =>
                                            toggleAddOn(g.id, a.id)
                                          }
                                        />
                                        <span>{a.name}</span>
                                      </div>

                                      <span className="font-medium">
                                        {formatUsd(a.price)}
                                      </span>
                                    </Label>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null}

        <AddToCartButton
          addOns={selectedAddOns}
          itemName={item.name}
          menuItemId={item.id}
          imageUrl={item.imageUrl}
          priceType={item.priceType}
          unitBasePrice={unitBasePricePaise}
          categorySlug={derivedCategorySlug ?? ""}
          menuId={derivedMenuId ?? ""}
          open={derivedOpen}
          variant={
            item.priceType === "VARIANT" && selectedVariant
              ? {
                  id: selectedVariant.id,
                  name: selectedVariant.name,
                  price: selectedVariant.price,
                }
              : null
          }
        />
      </div>
    </div>
  );
};

export default FullMenuItemCardFrontend;
