"use client";

import * as React from "react";
import { PromoBanner } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { PromoBannerUpsertInput, promoBannerUpsertSchema } from "@/lib/validators/promoValidator";
import { createPromoBannerAction } from "@/lib/actions/dashboard/promotions/createPromoBanner";
import { updatePromoBannerAction } from "@/lib/actions/dashboard/promotions/updatePromoBanner";
import { FileUpload } from "@/components/global/FileUpload";


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

function PreviewBanner({
  title,
  message,
  backgroundColor,
  textColor,
  bannerType,
}: {
  title?: string;
  message?: string;
  backgroundColor?: string | null;
  textColor?: string | null;
  bannerType?: string;
}) {
  const style: React.CSSProperties = {
    background: backgroundColor || undefined,
    color: textColor || undefined,
  };

  return (
    <div className="rounded-2xl border p-4" style={style}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">
          {title || "Promo title"}
          <span className="ml-2 text-xs opacity-70">
            ({bannerType || "INFO"})
          </span>
        </div>
      </div>
      <div className="mt-1 text-sm opacity-90">
        {message || "Promo message goes here."}
      </div>
    </div>
  );
}

export default function PromoBannerUpsertDialog({
  open,
  onOpenChange,
  mode,
  banner,
  onCreated,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  banner?: PromoBanner;
  onCreated?: (b: PromoBanner) => void;
  onUpdated?: (b: PromoBanner) => void;
}) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<PromoBannerUpsertInput>({
    resolver: zodResolver(promoBannerUpsertSchema) as any,
    defaultValues: {
      id: banner?.id,
      title: banner?.title ?? "",
      message: banner?.message ?? "",
      bannerType: (banner?.bannerType as any) ?? "INFO",

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
      };

      const res =
        mode === "create"
          ? await createPromoBannerAction(payload)
          : await updatePromoBannerAction(payload);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Promotion" : "Edit Promotion"}
          </DialogTitle>
          <DialogDescription>
            Configure placements, schedule, and styling. This will show on
            selected pages when active.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
            

          {/* Live preview */}
          
        </div>
      </DialogContent>
    </Dialog>
  );
}
