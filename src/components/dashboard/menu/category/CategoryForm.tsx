"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

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
import { Textarea } from "@/components/ui/textarea";

import FormLayout from "@/components/global/FormLayout";
import LoadingButton from "@/components/global/LoadingButton";
import { createCategoryAction } from "@/lib/actions/dashboard/menu/category/createCategoryAction";
import { updateCategoryAction } from "@/lib/actions/dashboard/menu/category/updateCategoryAction";
import { slugify } from "@/lib/helpers/SlugHelper";
import {
  createCategorySchema,
  CreateCategorySchemaRequest,
} from "@/lib/validators/categoryValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CategoryForm({
  mode,
  initial,
  setOpen,
  menuId,
}: {
  mode: "create" | "edit";
  initial?: Partial<Category>;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  menuId: string;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [status, setStatus] = React.useState<
    CreateCategorySchemaRequest["status"]
  >((initial?.status as any) ?? "ACTIVE");
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<CreateCategorySchemaRequest>({
    resolver: zodResolver(createCategorySchema) as any,
    defaultValues: {
      id: initial?.id ?? undefined,
      description: initial?.description ?? "",
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      status: initial?.status ?? "ACTIVE",
      menuId,
    },
  });

  React.useEffect(() => {
    form.setValue("slug", slugify(form.watch("name")));
  }, [form.watch("name")]);

  const onSubmit = (values: CreateCategorySchemaRequest) => {
    setError(null);

    start(async () => {
      const res =
        mode === "create"
          ? await createCategoryAction(values)
          : await updateCategoryAction(values);

      if (!res.ok) {
        setError(res.message);
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.push(`/dashboard/menu/${menuId}`);
      router.refresh();
      if (setOpen) {
        setOpen(false);
      }
    });
  };

  return (
    <FormLayout
      title={mode === "create" ? "New Catgeory" : "Edit Category"}
      description={
        mode === "create"
          ? "You can add categories and menu Items inside."
          : "Update catgeory details."
      }
      footer={
        <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen  && setOpen(false)}
            disabled={pending}>
            Cancel
          </Button>

          <Button
            type="submit"
            form="category-form"
            disabled={pending || !form.formState.isValid}>
            {pending ? (
              <LoadingButton></LoadingButton>
            ) : mode === "create" ? (
              "Create Category"
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
          id="category-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5">
          {/* SECTION: Company */}

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Menu Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Pizzeria" {...field} />
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
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Various information about pizzeria"
                    {...field}
                    value={field.value!}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Optional (recommended for webiste catalog).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Optional: hidden submit button for Enter key */}
          <button type="submit" className="hidden" />
        </form>
      </Form>
    </FormLayout>
  );
}
