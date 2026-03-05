import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatUsd } from "@/lib/helpers/formatCurrency";
import { useCartStore } from "@/lib/store/cart.store";
import { cn } from "@/lib/utils";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";

interface CartSheetProps {}

const CartSheet: FC<CartSheetProps> = ({}) => {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const totalQty = useCartStore((s) => s.totalQty());
  const subtotal = useCartStore((s) => s.subtotal());

  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative h-10 ">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart
          {totalQty > 0 ? (
            <Badge className="ml-2 rounded-full px-2 py-0.5">{totalQty}</Badge>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="mt-8">
          <SheetTitle className="flex items-center justify-between text-3xl font-serif">
            <span>Selected Dishes</span>
            {items.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground font-sans"
                onClick={clear}>
                Clear
              </Button>
            ) : null}
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-3" />

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="grid place-items-center py-12 text-center">
              <div className="text-base font-semibold">Cart is empty</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Add some items from the menu.
              </p>
              <Link
                href={"/menu"}
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "group -ml-2 mt-4",
                )}>
                <ArrowLeft className="group-hover:-translate-x-1 transition-all duration-300 ease-in-out"></ArrowLeft>{" "}
                Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {items.map((line) => (
                <div
                  key={line.key}
                  className="flex gap-3 rounded-2xl border bg-background p-3">
                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={line.imageUrl || "/placeholder.png"}
                      alt={line.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/menu/${line.menuId}?category=${line.categorySlug}`}
                          className="truncate font-semibold">
                          {line.name}
                        </Link>

                        {line.variant?.name ? (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            Variant: {line.variant.name}
                          </div>
                        ) : null}

                        {line.addOns.length > 0 ? (
                          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            Add-ons: {line.addOns.map((a) => a.name).join(", ")}
                          </div>
                        ) : null}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(line.key)}
                        aria-label="Remove item">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* qty + price */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          onClick={() => setQty(line.key, line.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>

                        <div className="min-w-9 text-center text-sm font-semibold">
                          {line.quantity}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          onClick={() => setQty(line.key, line.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {formatUsd(line.unitTotalPrice)} each
                        </div>
                        <div className="font-semibold">
                          {formatUsd(line.lineTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer totals */}
        <Separator className="my-3" />

        <SheetFooter className="flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Subtotal</div>
            <div className="text-base font-semibold">{formatUsd(subtotal)}</div>
          </div>

          <div className="grid gap-2">
            <Button
              asChild
              onClick={() => setOpen(false)}
              className="rounded-xl"
              disabled={items.length === 0}>
              <Link href="/cart">View cart</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Taxes/packing fees can be calculated at checkout (based on your
            rules).
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
