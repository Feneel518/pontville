
"use client";

import React, { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { getAddOnOptionsAction } from "@/lib/actions/frontend/getAddOnOptionsAction";
import { formatUsd } from "@/lib/helpers/formatCurrency";
import { useCartStore } from "@/lib/store/cart.store";
import { getMenusOpenStateAction } from "@/lib/helpers/getMenuOpenStateAction";

interface CartPageProps {}

type AddOnSelection = "SINGLE" | "MULTI";

type AddOn = {
  id: string;
  name: string;
  price: number;
  groupId: string;
  groupName: string;
};

type CartLine = {
  key: string;
  menuItemId: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  variant?: { name?: string | null } | null;
  addOns: AddOn[];
  unitTotalPrice: number;
  lineTotal: number;
  menuId: string;
  categorySlug: string;
};

type AddOnOption = {
  id: string;
  name: string;
  price: number;
};

type AddOnGroup = {
  id: string;
  name: string;
  selection: AddOnSelection;
  minSelect?: number | null;
  maxSelect?: number | null;
  addOns: AddOnOption[];
};

type OptionsForMenuItem = {
  id: string; // menuItemId
  addOnGroups: AddOnGroup[];
};

function AddOnChips({ line }: { line: CartLine }) {
  if (!line.addOns?.length) {
    return <div className="text-xs text-muted-foreground">No add-ons</div>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {line.addOns.map((a) => (
        <span
          key={`${a.groupId}-${a.id}`}
          className="rounded-full border bg-muted/40 px-2 py-0.5 text-[11px]">
          {a.name}
        </span>
      ))}
    </div>
  );
}

/**
 * Modal picker works on a LOCAL selection state.
 * - User edits inside modal
 * - Only when "Save" clicked -> updates store
 */
function AddOnModal({
  line,
  opt,
  onSave,
}: {
  line: CartLine;
  opt: OptionsForMenuItem;
  onSave: (nextAddOns: AddOn[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<AddOn[]>(line.addOns ?? []);

  // whenever modal opens, sync draft with latest line.addOns
  React.useEffect(() => {
    if (open) setDraft(line.addOns ?? []);
  }, [open, line.addOns]);

  const toggleAddOn = (g: AddOnGroup, a: AddOnOption) => {
    const exists = draft.some((x) => x.id === a.id);

    if (!exists) {
      let next = [...draft];

      // SINGLE: remove others from same group
      if (g.selection === "SINGLE") {
        next = next.filter((x) => x.groupId !== g.id);
      }

      next.push({
        id: a.id,
        name: a.name,
        price: a.price,
        groupId: g.id,
        groupName: g.name,
      });

      // MULTI maxSelect: keep latest N (drop earliest in group)
      if (g.selection === "MULTI" && g.maxSelect != null) {
        const inGroup = next.filter((x) => x.groupId === g.id);
        if (inGroup.length > g.maxSelect) {
          const dropId = inGroup[0]?.id;
          next = next.filter((x) => x.id !== dropId);
        }
      }

      setDraft(next);
      return;
    }

    setDraft((prev) => prev.filter((x) => x.id !== a.id));
  };

  const validateGroups = (): { ok: boolean; message?: string } => {
    for (const g of opt.addOnGroups) {
      const count = draft.filter((x) => x.groupId === g.id).length;
      const min = g.minSelect ?? 0;
      if (count < min) {
        return {
          ok: false,
          message: `Please select at least ${min} in "${g.name}".`,
        };
      }
      if (g.maxSelect != null && count > g.maxSelect) {
        return {
          ok: false,
          message: `Please select up to ${g.maxSelect} in "${g.name}".`,
        };
      }
      if (g.selection === "SINGLE" && count > 1) {
        return { ok: false, message: `Only 1 allowed in "${g.name}".` };
      }
    }
    return { ok: true };
  };

  const onClickSave = () => {
    const v = validateGroups();
    if (!v.ok) {
      toast.error("Add-ons not valid", { description: v.message });
      return;
    }

    onSave(draft);
    toast.success("Add-ons updated");
    setOpen(false);
  };

  const selectedCount = draft.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl shrink-0">
          Add Add-Ons
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="p-5">
          <DialogHeader>
            <DialogTitle className="text-base">
              Customize • {line.name}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Selected: <span className="font-medium">{selectedCount}</span>
            </div>

            <Button
              variant="ghost"
              className="rounded-xl text-muted-foreground"
              onClick={() => setDraft([])}>
              Clear selections
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="max-h-[60vh] overflow-auto pr-1 space-y-4">
            {opt.addOnGroups.map((g) => {
              const groupSelected = draft.filter((x) => x.groupId === g.id);
              const selectedIds = new Set(groupSelected.map((x) => x.id));

              return (
                <div key={g.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {g.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {g.selection === "SINGLE"
                          ? "Choose 1"
                          : g.maxSelect
                            ? `Choose up to ${g.maxSelect}`
                            : "Choose multiple"}
                        {g.minSelect ? ` • Min ${g.minSelect}` : ""}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs text-muted-foreground">
                      Selected:{" "}
                      <span className="font-medium">
                        {groupSelected.length}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {g.addOns.map((a) => {
                      const isAdded = selectedIds.has(a.id);

                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleAddOn(g, a)}
                          className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition ${
                            isAdded ? "bg-muted/40" : "hover:bg-muted/20"
                          }`}>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {a.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              +{formatUsd(a.price)}
                            </div>
                          </div>

                          <Button
                            variant={"default"}
                            className={`shrink-0 text-xs font-semibold `}>
                            {isAdded ? "Added ✓" : "Add"}
                          </Button>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button className="rounded-xl" onClick={onClickSave}>
              Save add-ons
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const CartPage: FC<CartPageProps> = () => {
  const items = useCartStore((s) => s.items) as CartLine[];
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const subtotal = useCartStore((s) => s.subtotal());
  const totalQty = useCartStore((s) => s.totalQty());

  const updateLineAddOns = useCartStore((s) => (s as any).updateLineAddOns) as
    | ((p: { key: string; addOns: AddOn[] }) => void)
    | undefined;

  const [optionsByItemId, setOptionsByItemId] = React.useState<
    Record<string, OptionsForMenuItem>
  >({});

  React.useEffect(() => {
    const ids = Array.from(new Set(items.map((i) => i.menuItemId)));
    if (!ids.length) return;

    (async () => {
      try {
        const res = (await getAddOnOptionsAction(ids)) as OptionsForMenuItem[];
        const map: Record<string, OptionsForMenuItem> = {};
        for (const r of res) map[r.id] = r;
        setOptionsByItemId(map);
      } catch {
        toast.error("Failed to load add-ons");
      }
    })();
  }, [items]);

  const [menuStates, setMenuStates] = React.useState<
    {
      menuId: string;
      menuName: string;
      isOpen: boolean;
      opensAt: string | null;
    }[]
  >([]);
  const [menuStateLoading, setMenuStateLoading] = React.useState(false);

  React.useEffect(() => {
    const menuIds = Array.from(
      new Set(items.map((i) => i.menuId).filter(Boolean)),
    );
    if (menuIds.length === 0) {
      setMenuStates([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setMenuStateLoading(true);
      try {
        const res = await getMenusOpenStateAction(menuIds);
        if (cancelled) return;
        const payload = res.states.map((ma) => {
          return {
            menuId: ma.menuId,
            menuName: ma.menuName,
            isOpen: ma.isOpen,
            opensAt: ma.opensAt,
          };
        });
        if (res.ok) setMenuStates(payload);
      } catch {
        // if this fails, don't hard-block UI; server must still enforce later
        if (!cancelled) setMenuStates([]);
      } finally {
        if (!cancelled) setMenuStateLoading(false);
      }
    })();

    // optional refresh every 60s
    const t = setInterval(() => {
      getMenusOpenStateAction(menuIds)
        .then((res) => {
          const payload = res.states.map((ma) => {
            return {
              menuId: ma.menuId,
              menuName: ma.menuName,
              isOpen: ma.isOpen,
              opensAt: ma.opensAt,
            };
          });
          if (!cancelled && res.ok) setMenuStates(payload);
        })
        .catch(() => {});
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [items]);

  const closedMenus = menuStates.filter((m) => !m.isOpen);

  const checkoutDisabledReason =
    items.length === 0
      ? "Cart is empty"
      : menuStateLoading
        ? "Checking kitchen hours…"
        : closedMenus.length > 0
          ? closedMenus.length === 1
            ? `${closedMenus[0].menuName} is closed${closedMenus[0].opensAt ? ` • opens at ${closedMenus[0].opensAt}` : ""}`
            : `Some menus are closed (${closedMenus.length})`
          : null;

  const canCheckout = checkoutDisabledReason == null;

  return (
    <div className="w-full pb-10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Cart</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length === 0
              ? "Your cart is empty."
              : `${totalQty} item(s) • Review before checkout.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/menu">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue exploring
            </Link>
          </Button>

          {items.length > 0 && (
            <Button
              variant="ghost"
              className="rounded-xl text-muted-foreground"
              onClick={clear}>
              Clear cart
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.length === 0 ? (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Nothing here yet</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Add items from the menu and they’ll appear here.
              </CardContent>
            </Card>
          ) : (
            items.map((line) => {
              const opt = optionsByItemId[line.menuItemId];
              const hasAddOns = !!opt?.addOnGroups?.length;

              const menuId = line.menuId;

              const menu = menuStates.filter((me) => me.menuId === menuId);


              return (
                <Card key={line.key} className="rounded-2xl p-3">
                  <CardContent className="p-0">
                    <div className="flex gap-4 items-start">
                      {/* Image (stable size) */}
                      <div className="relative shrink-0 size-24 overflow-hidden rounded-2xl bg-muted">
                        <Image
                          src={line.imageUrl || "/placeholder.png"}
                          alt={line.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold leading-snug max-md:text-sm">
                              {line.name}{" "}
                              <span className="ml-4 text-xs text-muted-foreground">
                                {menu[0]?.menuName}
                              </span>
                            </div>

                            {line.variant?.name ? (
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                Variant: {line.variant.name}
                              </div>
                            ) : null}

                            {/* Add-ons compact row */}
                            {hasAddOns ? (
                              <div className="mt-2 flex items-start justify-between gap-3">
                                <AddOnChips line={line} />
                              </div>
                            ) : null}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(line.key)}
                            aria-label="Remove item">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <Separator className="my-3" />

                        {/* qty + prices */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-xl"
                              onClick={() =>
                                setQty(line.key, line.quantity - 1)
                              }>
                              <Minus className="h-4 w-4" />
                            </Button>

                            <div className="min-w-10 text-center text-sm font-semibold">
                              {line.quantity}
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-xl"
                              onClick={() =>
                                setQty(line.key, line.quantity + 1)
                              }>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {hasAddOns && updateLineAddOns ? (
                            <AddOnModal
                              line={line}
                              opt={opt}
                              onSave={(nextAddOns) =>
                                updateLineAddOns({
                                  key: line.key,
                                  addOns: nextAddOns,
                                })
                              }
                            />
                          ) : null}

                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {formatUsd(line.unitTotalPrice)} each
                            </div>
                            <div className="text-base font-semibold">
                              {formatUsd(line.lineTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium">{totalQty}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-semibold">
                  {formatUsd(subtotal)}
                </span>
              </div>

              <Separator />

              <div className="grid gap-2">
                {closedMenus.length > 0 && !menuStateLoading ? (
                  <div className="rounded-xl border bg-muted/30 p-3 text-xs">
                    <div className="font-medium">Kitchen closed for:</div>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      {closedMenus.map((m) => (
                        <li key={m.menuId}>
                          • {m.menuName}
                          {m.opensAt ? ` (opens at ${m.opensAt})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <Button
                  className="rounded-xl"
                  disabled={!canCheckout}
                  title={checkoutDisabledReason ?? undefined}
                  asChild={canCheckout}
                  onClick={() => {
                    if (!canCheckout) {
                      toast.error("Can't checkout", {
                        description: checkoutDisabledReason ?? undefined,
                      });
                    }
                  }}>
                  {canCheckout ? (
                    <Link href="/checkout">Proceed to checkout</Link>
                  ) : (
                    "Proceed to checkout"
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={items.length === 0}
                  asChild>
                  <Link href="/menu">Add more items</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Taxes / packing fees can be calculated at checkout based on your
                restaurant settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
