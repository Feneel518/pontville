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

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Menu, MenuOpeningHour } from "@prisma/client";
import {
  CreateMenuInput,
  createMenuSchema,
} from "@/lib/validators/menuValidator";
import { slugify } from "@/lib/helpers/SlugHelper";
import { createMenuAction } from "@/lib/actions/dashboard/menu/createMenuAction";
import { updateMenuAction } from "@/lib/actions/dashboard/menu/updateMenuAction";
import FormLayout from "@/components/global/FormLayout";
import LoadingButton from "@/components/global/LoadingButton";
import { FileUpload } from "@/components/global/FileUpload";
import { buildDefaultSchedules, WEEK_DAYS } from "@/lib/constants/Weekdays";
import DayScheduleRow from "./DayScheduleRow";
import MenuQrCard from "./MenuQRCode";

export default function MenuForm({
  mode,
  initial,
  setOpen,
}: {
  mode: "create" | "edit";
  initial?: Partial<Menu> & {
    openingHours: MenuOpeningHour[];
  };
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [status, setStatus] = React.useState<CreateMenuInput["status"]>(
    (initial?.status as any) ?? "ACTIVE",
  );
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<CreateMenuInput>({
    resolver: zodResolver(createMenuSchema) as any,
    defaultValues: {
      id: initial?.id ?? undefined,
      description: initial?.description ?? "",
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      status: initial?.status ?? "ACTIVE",
      imageUrl: initial?.imageUrl ?? "",
      sortOrder: initial?.sortOrder ?? undefined,
      schedules: buildDefaultSchedules(mode, initial?.openingHours), // ✅
    },
  });

  React.useEffect(() => {
    form.setValue("slug", slugify(form.watch("name")));
  }, [form.watch("name")]);

  const onSubmit = (values: CreateMenuInput) => {
    setError(null);

    start(async () => {
      const res =
        mode === "create"
          ? await createMenuAction(values)
          : await updateMenuAction(values);

      if (!res.ok) {
        setError(res.message);
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.push("/dashboard/menu");
      router.refresh();
      if (setOpen) {
        setOpen(false);
      }
    });
  };

  return (
    <FormLayout
      title={mode === "create" ? "New Menu" : "Edit Menu"}
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
            onClick={() => setOpen && setOpen(false)}
            disabled={pending}>
            Cancel
          </Button>

          <Button type="submit" form="menu-form" disabled={pending}>
            {pending ? (
              <LoadingButton></LoadingButton>
            ) : mode === "create" ? (
              "Create Menu"
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
          id="menu-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5">
          {/* SECTION: Company */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Menu Image</FormLabel>
                <FormControl>
                  <FileUpload
                    endpoint="menuImage"
                    onChange={field.onChange}
                    value={field.value}></FileUpload>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <MenuQrCard slug={form.watch("id")} />

          {WEEK_DAYS.map((day, dayIndex) => (
            <DayScheduleRow
              key={day}
              form={form}
              day={day}
              dayIndex={dayIndex}
            />
          ))}

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
