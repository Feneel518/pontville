"use client";

import { FileUpload } from "@/components/global/FileUpload";
import FormLayout from "@/components/global/FormLayout";
import LoadingButton from "@/components/global/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createMenuItemAction } from "@/lib/actions/dashboard/menu/menuItem/createMenuItemAction";
import { updateMenuItemAction } from "@/lib/actions/dashboard/menu/menuItem/updateMenuItemAction";
import { slugify } from "@/lib/helpers/SlugHelper";
import { MenuItemCardSelect } from "@/lib/types/MenuItemCards";
import {
  AddOnSchemaRequest,
  ItemVariantSchemaRequest,
  MenuItemSchema,
  MenuItemSchemaRequest,
} from "@/lib/validators/menuItemValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { MenuItem } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { Dispatch, FC, SetStateAction } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

interface MenuItemFormProps {
  mode: "create" | "edit";
  setOpen: Dispatch<SetStateAction<boolean>>;
  initial?: MenuItemCardSelect;
  categoryId: string;
}

const MenuItemForm: FC<MenuItemFormProps> = ({
  mode,
  setOpen,
  initial,
  categoryId,
}) => {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [status, setStatus] = React.useState<MenuItemSchemaRequest["status"]>(
    (initial?.status as any) ?? "ACTIVE",
  );
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<MenuItemSchemaRequest>({
    resolver: zodResolver(MenuItemSchema) as any,
    defaultValues: {
      id: initial?.id ?? undefined,
      categoryId,
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: (initial?.description as any) ?? "",
      imageUrl: (initial?.imageUrl as any) ?? "",
      priceType: (initial?.priceType as any) ?? "SIMPLE",
      basePrice: (initial?.basePrice as any) ?? null, // will set on submit
      status: (initial?.status as any) ?? "ACTIVE",
      isAvailable: (initial?.isAvailable as any) ?? true,
      sortOrder: (initial?.sortOrder as any) ?? 0,
      isVeg: (initial?.isVeg as any) ?? true,
      isVegan: (initial?.isVegan as any) ?? true,
      variants: (initial as any)?.variants?.length
        ? (initial as any).variants.map((v: any, idx: number) => ({
            id: v.id,
            name: v.name ?? "",
            price: v.price != null ? String(v.price) : "0",
            isAvailable: v.isAvailable ?? true,
            sortOrder: v.sortOrder ?? idx,
          }))
        : [],

      addOnGroups: (initial as any)?.addOnGroups?.length
        ? (initial as any).addOnGroups.map((g: any, gIdx: number) => ({
            id: g.id,
            name: g.name ?? "",
            selection: g.selection ?? "MULTI",
            minSelect: g.minSelect ?? 0,
            maxSelect: g.maxSelect ?? null,
            sortOrder: g.sortOrder ?? gIdx,
            addOns: (g.addOns ?? []).map((a: any, aIdx: number) => ({
              id: a.id,
              name: a.name ?? "",
              price: a.price != null ? String(a.price) : "0",
              isAvailable: a.isAvailable ?? true,
              sortOrder: a.sortOrder ?? aIdx,
            })),
          }))
        : [],
    },
  });

  // Auto slug from name (same style as your MenuForm)
  React.useEffect(() => {
    form.setValue("slug", slugify(form.watch("name")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("name")]);

  // Watch priceType to toggle fields
  const priceType = form.watch("priceType");

  // Keep basePrice null when VARIANT (hard rule)
  React.useEffect(() => {
    if (priceType === "VARIANT") {
      form.setValue("basePrice", null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceType]);

  // Field arrays
  const variantsFA = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const groupsFA = useFieldArray({
    control: form.control,
    name: "addOnGroups",
  });

  React.useEffect(() => {
    if (priceType === "SIMPLE") {
      // For SIMPLE: basePrice required; variants should be empty
      // Auto-clear variants to avoid validation errors
      if (variantsFA.fields.length > 0) variantsFA.replace([]);
    } else {
      // For VARIANT: basePrice must be null
      form.setValue("basePrice", null, { shouldValidate: true });
      // If user switches to VARIANT, optionally add one default variant for convenience
      if (variantsFA.fields.length === 0) {
        variantsFA.append({
          name: "",
          price: 0,
          isAvailable: true,
          sortOrder: 0,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceType]);

  const onSubmit = (values: MenuItemSchemaRequest) => {
    setError(null);

    start(async () => {
      const res =
        mode === "create"
          ? await createMenuItemAction(values)
          : await updateMenuItemAction(values);

      if (!res.ok) {
        setError(res.message);
        toast.error(res.message);
        return;
      }

      toast.success(res.message);

      // Adjust these routes to your structure
      //   router.push(`/dashboard/menu/${categoryId}/items`);
      router.refresh();

      if (setOpen) setOpen(false);
    });
  };

  return (
    <FormLayout
      title={mode === "create" ? "New Menu Item" : "Edit Menu Item"}
      description={
        mode === "create"
          ? "Create a menu item with variants & add-ons."
          : "Update menu item details, variants and add-ons."
      }
      footer={
        <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen && setOpen(false)}
            disabled={pending}>
            Cancel
          </Button>

          <Button type="submit" form="menuitem-form" disabled={pending}>
            {pending ? (
              <LoadingButton />
            ) : mode === "create" ? (
              "Create Item"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      }>
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Form {...form}>
        <form
          id="menuitem-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6">
          {/* Image */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Image</FormLabel>
                <FormControl>
                  <FileUpload
                    endpoint="menuItemImage"
                    onChange={field.onChange}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Name + Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Pizza" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Slug + Sort */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. pizza" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Auto-generated from name (editable).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? 0
                            : Number.parseInt(e.target.value, 10),
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Lower comes first.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Availability */}
          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <FormLabel className="text-base">Available</FormLabel>
                  <FormDescription className="text-xs">
                    Turn off to hide from ordering (without unpublishing).
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isVeg"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <FormLabel className="text-base">Vegeterian?</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isVegan"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <FormLabel className="text-base">Vegan?</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Short description for the menu/catalog"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pricing */}
          <div className="rounded-lg border p-4 space-y-4">
            <div className="text-sm font-semibold">Pricing</div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="priceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SIMPLE">SIMPLE</SelectItem>
                        <SelectItem value="VARIANT">VARIANT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      SIMPLE = one price. VARIANT = prices on variants.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dollars input */}
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 12.99"
                        disabled={priceType !== "SIMPLE"}
                        value={Number(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Dollars only (max 2 decimals).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Variants integrated */}
            {priceType === "VARIANT" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Variants</div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      variantsFA.append({
                        name: "",
                        price: 0,
                        isAvailable: true,
                        sortOrder: variantsFA.fields.length,
                      })
                    }>
                    Add Variant
                  </Button>
                </div>

                {variantsFA.fields.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Add at least one variant.
                  </div>
                ) : null}

                <div className="space-y-3">
                  {variantsFA.fields.map((v, idx) => (
                    <div key={v.id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">
                          Variant #{idx + 1}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => variantsFA.remove(idx)}>
                          Remove
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Small" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`variants.${idx}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 9.99"
                                  value={Number(field.value) ?? ""}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`variants.${idx}.sortOrder`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sort</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? 0}
                                  onChange={(e) =>
                                    field.onChange(
                                      Number.parseInt(
                                        e.target.value || "0",
                                        10,
                                      ),
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`variants.${idx}.isAvailable`}
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-md border p-3">
                            <div className="space-y-1">
                              <FormLabel className="text-sm">
                                Available
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Hide this variant from ordering.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Add-on Groups integrated */}
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Add-on Groups</div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  groupsFA.append({
                    name: "",
                    selection: "MULTI",
                    minSelect: 0,
                    maxSelect: null,
                    sortOrder: groupsFA.fields.length,
                    addOns: [],
                  })
                }>
                Add Group
              </Button>
            </div>

            <FormDescription className="text-xs">
              Example: “Extras” (MULTI), “Choose Dip” (SINGLE min 1 max 1).
            </FormDescription>

            {groupsFA.fields.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No add-on groups yet (optional).
              </div>
            ) : null}

            <div className="space-y-4">
              {groupsFA.fields.map((g, gIdx) => (
                <AddOnGroupCard
                  key={g.id}
                  form={form}
                  gIdx={gIdx}
                  removeGroup={() => groupsFA.remove(gIdx)}
                />
              ))}
            </div>
          </div>

          {/* Optional: hidden submit */}
          <button type="submit" className="hidden" />
        </form>
      </Form>
    </FormLayout>
  );
};

export default MenuItemForm;

/** Child component to manage nested addOns field array per group */
function AddOnGroupCard({
  form,
  gIdx,
  removeGroup,
}: {
  form: ReturnType<typeof useForm<MenuItemSchemaRequest>>;
  gIdx: number;
  removeGroup: () => void;
}) {
  const addOnsFA = useFieldArray({
    control: form.control,
    name: `addOnGroups.${gIdx}.addOns`,
  });

  const selection = form.watch(`addOnGroups.${gIdx}.selection`);

  // enforce SINGLE UI constraints (maxSelect=1)
  React.useEffect(() => {
    if (selection === "SINGLE") {
      form.setValue(`addOnGroups.${gIdx}.maxSelect`, 1, {
        shouldValidate: true,
      });
      const min = form.getValues(`addOnGroups.${gIdx}.minSelect`) ?? 0;
      if (min > 1) {
        form.setValue(`addOnGroups.${gIdx}.minSelect`, 1, {
          shouldValidate: true,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Group #{gIdx + 1}</div>
        <Button type="button" variant="destructive" onClick={removeGroup}>
          Remove Group
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name={`addOnGroups.${gIdx}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Extras" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`addOnGroups.${gIdx}.selection`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selection</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MULTI">MULTI</SelectItem>
                  <SelectItem value="SINGLE">SINGLE</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name={`addOnGroups.${gIdx}.minSelect`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Select</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? 0}
                  onChange={(e) =>
                    field.onChange(Number.parseInt(e.target.value || "0", 10))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`addOnGroups.${gIdx}.maxSelect`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Select</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={selection === "SINGLE"}
                  placeholder={
                    selection === "SINGLE" ? "1" : "Leave empty for unlimited"
                  }
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? null : Number.parseInt(v, 10));
                  }}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Empty = unlimited (MULTI). SINGLE is fixed to 1.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`addOnGroups.${gIdx}.sortOrder`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? 0}
                  onChange={(e) =>
                    field.onChange(Number.parseInt(e.target.value || "0", 10))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* AddOns */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Add-ons</div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              addOnsFA.append({
                name: "",
                price: 0,
                isAvailable: true,
                sortOrder: addOnsFA.fields.length,
              })
            }>
            Add Add-on
          </Button>
        </div>

        {addOnsFA.fields.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No add-ons in this group yet.
          </div>
        ) : null}

        <div className="space-y-3">
          {addOnsFA.fields.map((a, aIdx) => (
            <div key={a.id} className="rounded-md border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Add-on #{aIdx + 1}</div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => addOnsFA.remove(aIdx)}>
                  Remove
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name={`addOnGroups.${gIdx}.addOns.${aIdx}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Extra Cheese" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`addOnGroups.${gIdx}.addOns.${aIdx}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 1.50"
                          value={Number(field.value) ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`addOnGroups.${gIdx}.addOns.${aIdx}.sortOrder`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(
                              Number.parseInt(e.target.value || "0", 10),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`addOnGroups.${gIdx}.addOns.${aIdx}.isAvailable`}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-1">
                      <FormLabel className="text-sm">Available</FormLabel>
                      <FormDescription className="text-xs">
                        Hide this add-on from ordering.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
