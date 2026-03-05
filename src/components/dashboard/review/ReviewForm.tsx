"use client";

import * as React from "react";
import { Review } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ReviewUpsertInput,
  reviewUpsertSchema,
} from "@/lib/validators/reviewValidator";
import { createReviewAction } from "@/lib/actions/dashboard/review/createReviewAction";
import { FileUpload } from "@/components/global/FileUpload";

export default function ReviewForm({
  mode,
  open,
  onOpenChange,
  review,
  onCreated,
  onUpdated,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (v: boolean) => void;
  review?: Review;
  onCreated?: (r: Review) => void;
  onUpdated?: (r: Review) => void;
}) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<ReviewUpsertInput>({
    resolver: zodResolver(reviewUpsertSchema) as any,
    defaultValues: {
      id: review?.id,
      authorName: review?.authorName ?? "",
      authorPhoto: review?.authorPhoto ?? "",
      rating: review?.rating ?? 5,
      message: review?.message ?? "",
      source: (review?.source as any) ?? "GOOGLE",
      isFeatured: review?.isFeatured ?? true,
      displayOrder: review?.displayOrder ?? 0,
    },
  });

  React.useEffect(() => {
    if (!open) return;

    form.reset({
      id: review?.id,
      authorName: review?.authorName ?? "",
      authorPhoto: review?.authorPhoto ?? "",
      rating: review?.rating ?? 5,
      message: review?.message ?? "",
      source: (review?.source as any) ?? "GOOGLE",
      isFeatured: review?.isFeatured ?? true,
      displayOrder: review?.displayOrder ?? 0,
    });
  }, [open, review?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(values: ReviewUpsertInput) {
    startTransition(async () => {
      const payload: ReviewUpsertInput = {
        ...values,
        authorPhoto: values.authorPhoto ? values.authorPhoto : null,
      };

      const res = await createReviewAction(payload);

      if (!res.ok) {
        toast.error((res as any).error?.formErrors?.[0] ?? "Validation failed");
        return;
      }

      toast.success(mode === "create" ? "Review created" : "Review updated");

      if (mode === "create") onCreated?.(res.data);
      if (mode === "edit") onUpdated?.(res.data);

      onOpenChange(false);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">
          {mode === "create" ? "Add Review" : "Edit Review"}
        </div>
        <p className="text-sm text-muted-foreground">
          Paste reviews manually. Keep it short and readable.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reviewer name</FormLabel>
                  <FormControl>
                    <Input placeholder="Sarah M" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review text</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[120px]"
                    placeholder="Amazing atmosphere..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="authorPhoto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile photo URL (optional)</FormLabel>
                  <FormControl>
                    <FileUpload
                      endpoint="restaurantImage"
                      value={field.value ?? ""}
                      onChange={field.onChange}></FileUpload>
                  </FormControl>
                  <FormDescription>
                    Optional. Leave empty if you don’t want photos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GOOGLE">GOOGLE</SelectItem>
                      <SelectItem value="WEBSITE">WEBSITE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display order</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={999} {...field} />
                  </FormControl>
                  <FormDescription>Lower number shows first.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-2xl border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(!!v)}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="m-0">Show on website</FormLabel>
                    <FormDescription className="m-0">
                      If off, it stays hidden from frontend.
                    </FormDescription>
                  </div>
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
    </div>
  );
}
