import React, { FC } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import {
  PromoBannerUpsertInput,
  promoBannerUpsertSchema,
} from "@/lib/validators/promoValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPromoBannerAction } from "../../../lib/actions/dashboard/promotions/createPromoBanner";
import { updatePromoBannerAction } from "../../../lib/actions/dashboard/promotions/updatePromoBanner";
import { PromoBanner } from "@prisma/client";
import { toast } from "sonner";
import { FileUpload } from "@/components/global/FileUpload";
import { Button } from "@/components/ui/button";

interface PromotionFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  banner?: PromoBanner;
  onCreated?: (b: PromoBanner) => void;
  onUpdated?: (b: PromoBanner) => void;
}

function toDatetimeLocalValue(d?: Date | null) {
  if (!d) return "";
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

const PromotionForm: FC<PromotionFormProps> = ({
  open,
  onOpenChange,
  mode,
  banner,
  onCreated,
  onUpdated,
}) => {
  const [isPending, startTransition] = React.useTransition();

  console.log(banner);

  const form = useForm<PromoBannerUpsertInput>({
    resolver: zodResolver(promoBannerUpsertSchema) as any,
    defaultValues: {
      id: banner?.id,
      title: banner?.title ?? "",
      message: banner?.message ?? "",
      bannerType: (banner?.bannerType as any) ?? "INFO",

      imageUrl: banner?.imageUrl ?? "",

      startAt: banner?.startAt ? toDatetimeLocalValue(banner.startAt) : "",
      endAt: banner?.endAt ? toDatetimeLocalValue(banner.endAt) : "",

      showOnHome: banner?.showOnHome ?? true,
      showOnMenu: banner?.showOnMenu ?? false,
      showOnEvents: banner?.showOnEvents ?? false,

      isActive: banner?.isActive ?? true,

      backgroundColor: banner?.backgroundColor ?? "",
      textColor: banner?.textColor ?? "",
    },
  });

  // When editing and banner changes, reset form values
  React.useEffect(() => {
    if (!open) return;
    form.reset({
      id: banner?.id,
      title: banner?.title ?? "",
      message: banner?.message ?? "",
      bannerType: (banner?.bannerType as any) ?? "INFO",

      startAt: banner?.startAt ? toDatetimeLocalValue(banner.startAt) : "",
      endAt: banner?.endAt ? toDatetimeLocalValue(banner.endAt) : "",

      imageUrl: banner?.imageUrl ?? "",

      showOnHome: banner?.showOnHome ?? true,
      showOnMenu: banner?.showOnMenu ?? false,
      showOnEvents: banner?.showOnEvents ?? false,

      isActive: banner?.isActive ?? true,

      backgroundColor: banner?.backgroundColor ?? "",
      textColor: banner?.textColor ?? "",
    });
  }, [open, banner?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const watch = form.watch();

  async function onSubmit(values: PromoBannerUpsertInput) {
    startTransition(async () => {
      // Normalize empty strings to null-ish for schema
      const payload: PromoBannerUpsertInput = {
        ...values,
        startAt: values.startAt ? values.startAt : null,
        endAt: values.endAt ? values.endAt : null,
        backgroundColor: values.backgroundColor ? values.backgroundColor : null,
        textColor: values.textColor ? values.textColor : null,
        imageUrl: values.imageUrl,
      };

      const res =
        mode === "create"
          ? await createPromoBannerAction(values)
          : await updatePromoBannerAction(values);

      if (!res.ok) {
        const formErrors = (res as any).error?.formErrors?.[0];
        toast.error(formErrors || "Validation failed");
        return;
      }

      toast.success(mode === "create" ? "Banner created" : "Banner updated");

      if (mode === "create") onCreated?.(res.data);
      if (mode === "edit") onUpdated?.(res.data);

      onOpenChange(false);
    });
  }
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image (optional)</FormLabel>
              <FormControl>
                <FileUpload
                  endpoint="eventImage"
                  onChange={field.onChange}
                  value={field.value}></FileUpload>
              </FormControl>
              <FormDescription>
                Paste an image URL (UploadThing integration next).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Happy Hour" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="2-for-1 cocktails from 5pm–7pm"
                  className="min-h-[110px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bannerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="SPECIAL">SPECIAL</SelectItem>
                  <SelectItem value="EVENT">EVENT</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Used for styling/semantics.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="startAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2 rounded-2xl border p-3">
          <div className="text-sm font-medium">Placements</div>

          <FormField
            control={form.control}
            name="showOnHome"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(!!v)}
                  />
                </FormControl>
                <FormLabel className="m-0">Home</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="showOnMenu"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(!!v)}
                  />
                </FormControl>
                <FormLabel className="m-0">Menu</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="showOnEvents"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(!!v)}
                  />
                </FormControl>
                <FormLabel className="m-0">Events</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="mt-2 flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(!!v)}
                  />
                </FormControl>
                <FormLabel className="m-0">Active</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="backgroundColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background</FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="textColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text</FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" className="rounded-xl" disabled={isPending}>
            {mode === "create" ? "Create" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PromotionForm;
