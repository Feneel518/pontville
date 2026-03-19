import ArrowButton from "@/components/ui/ArrowButton";
import { Button } from "@/components/ui/button";
import { to12HourTime } from "@/lib/helpers/timeHelpers";
import { cartKeyForUI, useCartStore } from "@/lib/store/cart.store";
import { MenuAvailabilityState } from "@/lib/types/menuAvailability";
import { cn } from "@/lib/utils";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { FC } from "react";
import { toast } from "sonner";

interface AddToCartButtonProps {
  menuItemId: string;
  itemName: string;
  imageUrl?: string | null;
  categorySlug: string;
  menuId: string;

  // config
  priceType: "SIMPLE" | "VARIANT";
  unitBasePrice: number;

  variant?: { id: string; name: string; price: number } | null;

  addOns?: {
    id: string;
    name: string;
    price: number;
    groupId?: string;
    groupName?: string;
  }[];

  className?: string;

  open: MenuAvailabilityState;
}

const AddToCartButton: FC<AddToCartButtonProps> = ({
  itemName,
  menuItemId,
  priceType,
  unitBasePrice,
  addOns = [],
  className,
  categorySlug,
  menuId,
  imageUrl,
  variant,
  open,
}) => {
  const router = useRouter();
  // ✅ subscribe only to what we need

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setQty = useCartStore((s) => s.setQty);

  const key = React.useMemo(() => {
    return cartKeyForUI({
      menuItemId,
      variantId: priceType === "VARIANT" ? (variant?.id ?? null) : null,
      addOnIds: addOns.map((a) => a.id),
    });
  }, [menuItemId, priceType, variant?.id, addOns]);

  const line = React.useMemo(
    () => items.find((i) => i.key === key),
    [items, key],
  );

  const qty = line?.quantity ?? 0;

  // guard: variant required if priceType=VARIANT
  const canAdd = priceType !== "VARIANT" || Boolean(variant?.id);

  if (!open.isOpen) {
    return <Button disabled>{open.message}</Button>;
  }

  if (!line) {
    return (
      <Button
        type="button"
        variant={"elegant"}
        className={cn("w-full rounded-xl group", className)}
        disabled={!canAdd}
        onClick={() => {
          if (!canAdd) return;

          addItem({
            menuItemId,
            name: itemName,
            imageUrl,
            categorySlug,
            menuId,
            unitBasePrice,
            variant: priceType === "VARIANT" ? (variant ?? null) : null,
            addOns,
            quantity: 1,
          });

          toast.custom(
            (t: any) => (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-md border">
                <div className="font-medium text-sm">
                  {itemName} added to cart
                </div>
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => {
                    toast.dismiss(t);
                    router.push("/cart");
                  }}>
                  View Cart
                </Button>
              </div>
            ),
            { duration: 2500 },
          );
        }}>
        <div className="flex items-center justify-center gap-2 ">
          <div className={`relative h-4 w-[200px] shrink-0 inline-block `}>
            <Image
              src="/Arrow.svg"
              alt="Arrow"
              fill
              className={`object-contain }`}
            />
          </div>
          Add to cart
        </div>
        {/* <ArrowButton direction="right" label="Add to cart"></ArrowButton> */}
      </Button>
    );
  }
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2",
        className,
      )}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-xl"
        onClick={() => {
          if (qty === 1) {
            setQty(key, 0);

            toast.custom(
              (t: any) => (
                <div className="flex items-center gap-3 bg-red-100 p-3 rounded-xl shadow-md border">
                  <div className="flex flex-col">
                    <div className="font-medium text-sm">
                      <span className="font-bold text-nowrap">{itemName}</span>
                      <br /> Removed from cart
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => {
                      toast.dismiss(t);
                      router.push("/cart");
                    }}>
                    View Cart
                  </Button>
                </div>
              ),
              { duration: 2500 },
            );
          } else {
            setQty(key, qty - 1);

            toast.custom(
              (t: any) => (
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-md border">
                  <div className="flex flex-col">
                    <div className="font-medium text-sm">
                      <span className="font-bold text-nowrap">{itemName}</span>
                      <br /> Reduced quantity • Qty: {qty - 1}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => {
                      toast.dismiss(t);
                      router.push("/cart");
                    }}>
                    View Cart
                  </Button>
                </div>
              ),
              { duration: 2500 },
            );
          }
        }}>
        <Minus className="h-4 w-4" />
      </Button>

      <div className="flex-1 rounded-xl border bg-background py-2 text-center font-semibold">
        {qty}
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-xl"
        onClick={() => {
          setQty(key, qty + 1);
          toast.custom(
            (t: any) => (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-md border">
                <div className="flex flex-col">
                  <div className="font-medium text-sm">
                    <span className="font-bold text-nowrap">{itemName}</span>
                    <br /> Increased quantity • Qty: {qty + 1}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => {
                    toast.dismiss(t);
                    router.push("/cart");
                  }}>
                  View Cart
                </Button>
              </div>
            ),
            { duration: 2500 },
          );
        }}
        disabled={!canAdd}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AddToCartButton;
