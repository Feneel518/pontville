"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MenuItemCardSelect } from "@/lib/types/MenuItemCards";
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

interface MenuItemCardFrontendProps {
  item: MenuItemCardSelect;
  categorySlug: string;
  menuId: string;
  open: {
    isOpen: boolean;
    closesAt?: string;
    opensAt?: string;
  };
}

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

const MenuItemCardFrontend: FC<MenuItemCardFrontendProps> = ({
  item,
  categorySlug,
  menuId,
  open,
}) => {
  const hasVariants = item.priceType === "VARIANT" && item.variants.length > 0;

  // Default variant: cheapest available
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

  // Selected variant
  const selectedVariant = React.useMemo(() => {
    if (!hasVariants) return undefined;
    return item.variants.find((v) => v.id === variantId);
  }, [hasVariants, item.variants, variantId]);

  // Base price (paise)
  const unitBasePricePaise = React.useMemo(() => {
    if (item.priceType === "SIMPLE") return item.basePrice ?? 0;
    // VARIANT
    if (!selectedVariant) return 0;
    return selectedVariant.price;
  }, [item.basePrice, item.priceType, selectedVariant]);

  const priceLabel = getPriceLabel(item);
  //  const chips = getChips(item);

  function clampMulti(ids: string[], maxSelect: number | null | undefined) {
    if (maxSelect == null) return ids;
    if (ids.length <= maxSelect) return ids;
    // keep the most recent selections
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

      // SINGLE behaves like radio (select 1); allow deselect only if minSelect = 0
      if (group.selection === "SINGLE") {
        const isSame = current.length === 1 && current[0] === addOnId;
        if (isSame && (group.minSelect ?? 0) === 0) {
          return { ...prev, [groupId]: [] };
        }
        return { ...prev, [groupId]: [addOnId] };
      }

      // MULTI
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
          price: addOn.price, // Int cents/paise
          groupId: g.id,
          groupName: g.name,
        });
      }
    }

    return list;
  }, [groups, selectedByGroup]);

  return (
    <div className="group relative w-full h-full rounded-4xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md p-3 space-y-3 justify-between flex flex-col">
      <div className="flex flex-col gap-3">
        {/* Top Image panel */}
        <div className="relative overflow-hidden rounded-3xl ">
          <div className="relative aspect-4/3 w-full overflow-hidden">
            <Image
              src={item.imageUrl || "/placeholder.png"}
              alt={item.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02] rounded-[28px]  "
              sizes="(max-width: 768px) 100vw, 360px"
              priority={false}
            />
          </div>

          {/*  tag */}
          <div className="absolute right-3 top-3 z-10 rounded-full  text-sm font-semibold ">
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
          <div className="flex items-center truncate  justify-center bg-black/10  py-2 pt-8 -mt-6 text-xs text-black/70">
            <p className="">{item.name}</p>
          </div>
        </div>

        <div className="space-y-3 ">
          <div className="flex items-start justify-between gap-3 ">
            <div className="min-w-0 w-full">
              <div className=" text-xl w-full font-serif flex items-start gap-8 justify-between">
                <h3>{item.name}</h3>
                <h3 className="text-3xl">{formatUsd(unitBasePricePaise)}</h3>
              </div>
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
          <Accordion
            type="single"
            collapsible
            className="w-full"
            // optional: defaultValue="customize"
          >
            <AccordionItem value="customize" className="border-none">
              <AccordionTrigger className="rounded-xl border bg-muted/30 px-3 py-2 text-sm font-medium hover:no-underline">
                Customize
              </AccordionTrigger>

              <AccordionContent className="pt-3 space-y-4">
                {/* Variants */}
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
                      className="grid gap-2 grid-cols-2">
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

                {/* Add-ons */}
                {groups.length > 0 ? (
                  <div className="space-y-4">
                    {groups.map((g) => {
                      const selectedIds = selectedByGroup[g.id] ?? [];
                      const max = g.selection === "SINGLE" ? 1 : g.maxSelect;

                      return (
                        <div
                          key={g.id}
                          className="rounded-2xl border bg-muted/30 p-4 space-y-3">
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
          categorySlug={categorySlug}
          menuId={menuId}
          open={open}
          variant={
            item.priceType === "VARIANT" && selectedVariant
              ? {
                  id: selectedVariant.id,
                  name: selectedVariant.name,
                  price: selectedVariant.price,
                }
              : null
          }></AddToCartButton>
      </div>
    </div>
  );
};

export default MenuItemCardFrontend;

//  {
//    groups.length > 0 ? (
//      <div className="space-y-4">
//        {groups.map((g) => {
//          const selectedIds = selectedByGroup[g.id] ?? [];

//          const max = g.selection === "SINGLE" ? 1 : g.maxSelect;

//          return (
//            <div
//              key={g.id}
//              className="rounded-2xl border bg-muted/30 p-4 space-y-3">
//              {/* Header */}
//              <div className="flex items-start justify-between gap-3">
//                <div>
//                  <div className="text-sm font-semibold">{g.name}</div>
//                  <div className="text-xs text-muted-foreground">
//                    {g.selection === "SINGLE"
//                      ? "Choose 1"
//                      : "Choose multiple"}
//                    {g.minSelect > 0 ? ` • min ${g.minSelect}` : ""}
//                    {max != null ? ` • max ${max}` : ""}
//                  </div>
//                </div>

//                {selectedIds.length > 0 ? (
//                  <Badge variant="secondary" className="rounded-full">
//                    {selectedIds.length} selected
//                  </Badge>
//                ) : null}
//              </div>

//              {/* SINGLE selection → RadioGroup */}
//              {g.selection === "SINGLE" ? (
//                <RadioGroup
//                  value={selectedIds[0] ?? ""}
//                  onValueChange={(value) => {
//                    toggleAddOn(g.id, value);
//                  }}
//                  className="grid gap-2">
//                  {g.addOns
//                    .filter((a) => a.isAvailable)
//                    .map((a) => (
//                      <Label
//                        key={a.id}
//                        htmlFor={`addon-${g.id}-${a.id}`}
//                        className={cn(
//                          "flex cursor-pointer items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm",
//                          selectedIds.includes(a.id) && "border-primary",
//                        )}>
//                        <div className="flex items-center gap-2">
//                          <RadioGroupItem
//                            id={`addon-${g.id}-${a.id}`}
//                            value={a.id}
//                          />
//                          <span>{a.name}</span>
//                        </div>

//                        <span className="font-medium">
//                          {formatUsd(a.price)}
//                        </span>
//                      </Label>
//                    ))}
//                </RadioGroup>
//              ) : (
//                /* MULTI selection → Checkbox */
//                <div className="grid grid-cols-2 gap-2">
//                  {g.addOns
//                    .filter((a) => a.isAvailable)
//                    .map((a) => {
//                      const checked = selectedIds.includes(a.id);

//                      return (
//                        <Label
//                          key={a.id}
//                          htmlFor={`addon-${g.id}-${a.id}`}
//                          className={cn(
//                            "flex cursor-pointer items-center justify-between rounded-lg border bg-background  p-2  text-sm",
//                            checked && "border-primary",
//                          )}>
//                          <div className="flex items-center gap-2 h">
//                            <Checkbox
//                              id={`addon-${g.id}-${a.id}`}
//                              checked={checked}
//                              onCheckedChange={() => {
//                                toggleAddOn(g.id, a.id);
//                              }}
//                            />
//                            <span>{a.name}</span>
//                          </div>

//                          <span className="font-medium">
//                            {formatUsd(a.price)}
//                          </span>
//                        </Label>
//                      );
//                    })}
//                </div>
//              )}
//            </div>
//          );
//        })}
//      </div>
//    ) : null;
//  }

// "use client";

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { MenuItemCardSelect } from "@/lib/types/MenuItemCards";
// import Image from "next/image";
// import React from "react";
// import AddToCartButton from "../cart/AddToCartButton";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { cn } from "@/lib/utils";

// function toNumberSafe(v: unknown) {
//   const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
//   return Number.isFinite(n) ? n : null;
// }

// function formatUsd(v: string | number | null | undefined) {
//   const n = toNumberSafe(v);
//   if (n == null) return "—";
//   return `$${n.toFixed(2).replace(/\.00$/, "")}`;
// }

// function getCheapestAvailableVariantId(item: MenuItemCardSelect) {
//   let bestId: string | undefined = undefined;
//   let bestPrice = Number.POSITIVE_INFINITY;

//   for (const v of item.variants ?? []) {
//     if (!v.isAvailable) continue;
//     const p = typeof v.price === "number" ? v.price : Number(v.price);
//     if (!Number.isFinite(p)) continue;
//     if (p < bestPrice) {
//       bestPrice = p;
//       bestId = v.id;
//     }
//   }
//   return bestId;
// }

// export default function MenuItemCardFrontend({
//   item,
//   categorySlug,
//   menuId,
//   open,
//   index,
// }: {
//   item: MenuItemCardSelect;
//   categorySlug: string;
//   menuId: string;
//   index: number;
//   open: { isOpen: boolean; closesAt?: string; opensAt?: string };
// }) {
//   const hasVariants =
//     item.priceType === "VARIANT" && (item.variants?.length ?? 0) > 0;
//   const hasAddOns = (item.addOnGroups?.length ?? 0) > 0;
//   const needsCustomize = hasVariants || hasAddOns;

//   const defaultVariantId = React.useMemo(() => {
//     if (!hasVariants) return undefined;
//     return getCheapestAvailableVariantId(item);
//   }, [hasVariants, item]);

//   const [variantId, setVariantId] = React.useState<string | undefined>(
//     defaultVariantId,
//   );

//   React.useEffect(() => {
//     setVariantId(defaultVariantId);
//   }, [defaultVariantId]);

//   const selectedVariant = React.useMemo(() => {
//     if (!hasVariants) return undefined;
//     return (item.variants ?? []).find((v) => v.id === variantId);
//   }, [hasVariants, item.variants, variantId]);

//   const unitBasePricePaise = React.useMemo(() => {
//     if (item.priceType === "SIMPLE") return item.basePrice ?? 0;
//     return selectedVariant?.price ?? 0;
//   }, [item.priceType, item.basePrice, selectedVariant]);

//   // ---- Heavy customization state only used inside dialog ----
//   const groups = item.addOnGroups ?? [];
//   const [selectedByGroup, setSelectedByGroup] = React.useState<
//     Record<string, string[]>
//   >({});

//   function clampMulti(ids: string[], maxSelect: number | null | undefined) {
//     if (maxSelect == null) return ids;
//     if (ids.length <= maxSelect) return ids;
//     return ids.slice(ids.length - maxSelect);
//   }

//   function toggleAddOn(groupId: string, addOnId: string) {
//     const group = groups.find((g) => g.id === groupId);
//     if (!group) return;

//     setSelectedByGroup((prev) => {
//       const current = prev[groupId] ?? [];

//       if (group.selection === "SINGLE") {
//         const isSame = current.length === 1 && current[0] === addOnId;
//         if (isSame && (group.minSelect ?? 0) === 0)
//           return { ...prev, [groupId]: [] };
//         return { ...prev, [groupId]: [addOnId] };
//       }

//       const exists = current.includes(addOnId);
//       const next = exists
//         ? current.filter((x) => x !== addOnId)
//         : [...current, addOnId];
//       return { ...prev, [groupId]: clampMulti(next, group.maxSelect) };
//     });
//   }

//   const selectedAddOns = React.useMemo(() => {
//     const list: {
//       id: string;
//       name: string;
//       price: number;
//       groupId?: string;
//       groupName?: string;
//     }[] = [];
//     for (const g of groups) {
//       const selectedIds = selectedByGroup[g.id] ?? [];
//       for (const addOnId of selectedIds) {
//         const addOn = g.addOns.find((a) => a.id === addOnId);
//         if (!addOn) continue;
//         list.push({
//           id: addOn.id,
//           name: addOn.name,
//           price: addOn.price,
//           groupId: g.id,
//           groupName: g.name,
//         });
//       }
//     }
//     return list;
//   }, [groups, selectedByGroup]);

//   return (
//     <div className="group relative w-full h-full rounded-4xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md p-3 space-y-3 flex flex-col">
//       {/* Light card header */}
//       <div className="relative overflow-hidden rounded-3xl">
//         <div className="relative aspect-4/3 w-full overflow-hidden">
//           <Image
//             src={item.imageUrl || "/placeholder.png"}
//             alt={item.name}
//             fill
//             className="object-cover transition duration-300 group-hover:scale-[1.02] rounded-[28px]"
//             sizes="(max-width: 768px) 100vw, 360px"
//             priority={index < 2} // ✅ only first couple
//           />
//         </div>

//         <div className="absolute right-3 top-3 z-10">
//           {item.isVegan ? (
//             <Badge className="rounded-full border border-emerald-500/40 bg-emerald-500 text-white">
//               Vegan
//             </Badge>
//           ) : item.isVeg ? (
//             <Badge className="rounded-full border border-emerald-500/40 bg-emerald-500/50 text-white">
//               Veg
//             </Badge>
//           ) : (
//             <Badge className="rounded-full border border-rose-500/40 bg-rose-500/50 text-white">
//               Non-veg
//             </Badge>
//           )}
//         </div>
//       </div>

//       <div className="flex-1 space-y-2">
//         <div className="flex items-start justify-between gap-3">
//           <h3 className="text-xl font-serif">{item.name}</h3>
//           <div className="text-2xl font-serif">
//             {formatUsd(unitBasePricePaise)}
//           </div>
//         </div>

//         {item.description ? (
//           <p className="line-clamp-2 text-sm text-muted-foreground">
//             {item.description}
//           </p>
//         ) : null}

//         {/* ✅ Only render heavy UI when needed */}
//         {needsCustomize ? (
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="secondary" className="w-full rounded-xl">
//                 Customize
//               </Button>
//             </DialogTrigger>

//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>{item.name}</DialogTitle>
//               </DialogHeader>

//               {/* Variants */}
//               {hasVariants ? (
//                 <div className="rounded-xl border bg-muted/30 p-3">
//                   <div className="mb-2 text-sm font-medium">Choose variant</div>
//                   <RadioGroup
//                     value={variantId}
//                     onValueChange={setVariantId}
//                     className="grid gap-2 grid-cols-2">
//                     {(item.variants ?? [])
//                       .filter((v) => v.isAvailable)
//                       .map((v) => (
//                         <Label
//                           key={v.id}
//                           htmlFor={`variant-${item.id}-${v.id}`}
//                           className={cn(
//                             "flex cursor-pointer items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm",
//                             variantId === v.id && "border-primary",
//                           )}>
//                           <div className="flex items-center gap-2">
//                             <RadioGroupItem
//                               id={`variant-${item.id}-${v.id}`}
//                               value={v.id}
//                             />
//                             <span>{v.name}</span>
//                           </div>
//                           <span className="font-medium">
//                             {formatUsd(v.price)}
//                           </span>
//                         </Label>
//                       ))}
//                   </RadioGroup>
//                 </div>
//               ) : null}

//               {/* Add-ons */}
//               {hasAddOns ? (
//                 <div className="space-y-4">
//                   {groups.map((g) => {
//                     const selectedIds = selectedByGroup[g.id] ?? [];
//                     const max = g.selection === "SINGLE" ? 1 : g.maxSelect;

//                     return (
//                       <div
//                         key={g.id}
//                         className="rounded-2xl border bg-muted/30 p-4 space-y-3">
//                         <div className="flex items-start justify-between gap-3">
//                           <div>
//                             <div className="text-sm font-semibold">
//                               {g.name}
//                             </div>
//                             <div className="text-xs text-muted-foreground">
//                               {g.selection === "SINGLE"
//                                 ? "Choose 1"
//                                 : "Choose multiple"}
//                               {g.minSelect > 0 ? ` • min ${g.minSelect}` : ""}
//                               {max != null ? ` • max ${max}` : ""}
//                             </div>
//                           </div>

//                           {selectedIds.length > 0 ? (
//                             <Badge variant="secondary" className="rounded-full">
//                               {selectedIds.length} selected
//                             </Badge>
//                           ) : null}
//                         </div>

//                         {g.selection === "SINGLE" ? (
//                           <RadioGroup
//                             value={selectedIds[0] ?? ""}
//                             onValueChange={(value) => toggleAddOn(g.id, value)}
//                             className="grid gap-2">
//                             {g.addOns
//                               .filter((a) => a.isAvailable)
//                               .map((a) => (
//                                 <Label
//                                   key={a.id}
//                                   htmlFor={`addon-${g.id}-${a.id}`}
//                                   className={cn(
//                                     "flex cursor-pointer items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm",
//                                     selectedIds.includes(a.id) &&
//                                       "border-primary",
//                                   )}>
//                                   <div className="flex items-center gap-2">
//                                     <RadioGroupItem
//                                       id={`addon-${g.id}-${a.id}`}
//                                       value={a.id}
//                                     />
//                                     <span>{a.name}</span>
//                                   </div>
//                                   <span className="font-medium">
//                                     {formatUsd(a.price)}
//                                   </span>
//                                 </Label>
//                               ))}
//                           </RadioGroup>
//                         ) : (
//                           <div className="grid grid-cols-2 gap-2">
//                             {g.addOns
//                               .filter((a) => a.isAvailable)
//                               .map((a) => {
//                                 const checked = selectedIds.includes(a.id);
//                                 return (
//                                   <Label
//                                     key={a.id}
//                                     htmlFor={`addon-${g.id}-${a.id}`}
//                                     className={cn(
//                                       "flex cursor-pointer items-center justify-between rounded-lg border bg-background p-2 text-sm",
//                                       checked && "border-primary",
//                                     )}>
//                                     <div className="flex items-center gap-2">
//                                       <Checkbox
//                                         id={`addon-${g.id}-${a.id}`}
//                                         checked={checked}
//                                         onCheckedChange={() =>
//                                           toggleAddOn(g.id, a.id)
//                                         }
//                                       />
//                                       <span>{a.name}</span>
//                                     </div>
//                                     <span className="font-medium">
//                                       {formatUsd(a.price)}
//                                     </span>
//                                   </Label>
//                                 );
//                               })}
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : null}

//               <AddToCartButton
//                 addOns={selectedAddOns}
//                 itemName={item.name}
//                 menuItemId={item.id}
//                 imageUrl={item.imageUrl}
//                 priceType={item.priceType}
//                 unitBasePrice={unitBasePricePaise}
//                 categorySlug={categorySlug}
//                 menuId={menuId}
//                 open={open}
//                 variant={
//                   item.priceType === "VARIANT" && selectedVariant
//                     ? {
//                         id: selectedVariant.id,
//                         name: selectedVariant.name,
//                         price: selectedVariant.price,
//                       }
//                     : null
//                 }
//               />
//             </DialogContent>
//           </Dialog>
//         ) : (
//           // No customize needed: direct add
//           <AddToCartButton
//             addOns={[]}
//             itemName={item.name}
//             menuItemId={item.id}
//             imageUrl={item.imageUrl}
//             priceType={item.priceType}
//             unitBasePrice={unitBasePricePaise}
//             categorySlug={categorySlug}
//             menuId={menuId}
//             open={open}
//             variant={null}
//           />
//           // <div className=""></div>
//         )}
//       </div>
//     </div>
//   );
// }
