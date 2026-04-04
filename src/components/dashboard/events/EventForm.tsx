"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import React, { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoadingButton from "@/components/global/LoadingButton";
import { FileUpload } from "@/components/global/FileUpload";
import {
  EventFormSchema,
  EventFormValues,
} from "@/lib/validators/EventValidator";
import { createEventAction } from "@/lib/actions/dashboard/event/createEvent";
import { updateEventAction } from "@/lib/actions/dashboard/event/updateEvent";
import { Event } from "@prisma/client";

type Props = {
  mode: "create" | "edit";
  initial?: Event;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setOpenChange?: Dispatch<SetStateAction<boolean>>;
  open?: boolean;
  onCreated?: (b: Event) => void;
  onUpdated?: (b: Event) => void;
};

export default function EventForm({
  mode,
  initial,
  setOpen,
  open,
  setOpenChange,
  onCreated,
  onUpdated,
}: Props) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  const [error, setError] = React.useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      id: initial?.id ?? undefined,
      title: initial?.title ?? "",
      type: (initial?.type as any) ?? "",
      status: (initial?.status as any) ?? "DRAFT",

      startDate: initial?.startDate ?? new Date(),
      startTime: initial?.startTime?.slice(0, 5) ?? "19:00",

      endDate: initial?.endDate ?? null,
      endTime: initial?.endTime?.slice(0, 5) ?? null,

      description: initial?.description ?? "",
      highlight: initial?.highlight ?? null,

      ctaLabel: initial?.ctaLabel ?? "Book a table",
      ctaHref: initial?.ctaHref ?? "/contact",

      isTicketed: initial?.isTicketed ?? false,
      priceLabel: initial?.priceLabel ?? null,

      sortOrder: initial?.sortOrder ?? 0,
    },
  });

  const isTicketed = form.watch("isTicketed");
  const endDate = form.watch("endDate");

  async function onSubmit(values: EventFormValues) {
    start(async () => {
      const res =
        mode === "create"
          ? await createEventAction(values)
          : await updateEventAction(values);

      if (!res.ok) {
        setError(res.message);
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.push("/dashboard/events");
      router.refresh();
      setOpen(false);
      if (setOpenChange) {
        setOpenChange(false);
      }
      if (mode === "create") onCreated?.(res.data!);
      if (mode === "edit") onUpdated?.(res.data!);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Event Image</FormLabel>
              <FormControl>
                <FileUpload
                  endpoint="eventImage"
                  value={field.value}
                  onChange={field.onChange}></FileUpload>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Title + Type + Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Friday Night Live Music" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Input {...field} placeholder="TRVIA MUSIC"></Input>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                    <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                    <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dates + Times */}
        {/* <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4 space-y-4">
            <p className="text-sm font-medium">Start</p>

            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}>
                          {field.value
                            ? format(field.value, "EEE, dd MMM yyyy")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => d && field.onChange(d)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        id="time-picker-optional"
                        step="1"
                        defaultValue="10:30:00"
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </FormControl>
                    <FormDescription>24-hour format (HH:mm)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">End (optional)</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (endDate) {
                    form.setValue("endDate", null);
                    form.setValue("endTime", null);
                  } else {
                    // default: same day end date + 21:00
                    form.setValue("endDate", form.getValues("startDate"));
                    form.setValue("endTime", "21:00");
                  }
                }}>
                {endDate ? "Remove end" : "Add end"}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!endDate}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}>
                        {field.value
                          ? format(field.value, "EEE, dd MMM yyyy")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ?? undefined}
                        onSelect={(d) => d && field.onChange(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      value={field.value ?? ""}
                      disabled={!endDate}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>
                    If not set, front-end can display “Late”.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div> */}

        <div className="grid  gap-4">
          <div className="grid md:grid-cols-2 gap-4 items-start">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal ",
                          !field.value && "text-muted-foreground",
                        )}>
                        {field.value
                          ? format(field.value, "EEE, dd MMM yyyy")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(d) => d && field.onChange(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      step={60}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? e.target.value.slice(0, 5) : "",
                        )
                      }
                      className="bg-background h-12 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </FormControl>
                  <FormDescription>24-hour format (HH:mm)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              if (endDate) {
                form.setValue("endDate", null);
                form.setValue("endTime", null);
              } else {
                // default: same day end date + 21:00
                form.setValue("endDate", form.getValues("startDate"));
                form.setValue("endTime", "21:00");
              }
            }}>
            {endDate ? "Remove end period" : "Add end period"}
          </Button>
          {endDate && (
            <div className="grid md:grid-cols-2 gap-4 items-start">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!endDate}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}>
                          {field.value
                            ? format(field.value, "EEE, dd MMM yyyy")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={(d) => d && field.onChange(d)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      {/* <Input
                      type="time"
                      value={field.value ?? ""}
                      disabled={!endDate}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      /> */}
                      <Input
                        type="time"
                        step={60}
                        value={field.value ?? ""}
                        disabled={!endDate}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? e.target.value.slice(0, 5) : null,
                          )
                        }
                        className="bg-background h-12 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </FormControl>
                    <FormDescription>
                      If not set, front-end can display “Late”.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="What’s happening, what’s included, etc."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Highlight + CTA */}
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="highlight"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Highlight (optional)</FormLabel>
                <FormControl>
                  <Input
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    placeholder="Happy Hour 5–7 PM"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ctaLabel"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>CTA label</FormLabel>
                <FormControl>
                  <Input
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    placeholder="Book a table"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ctaHref"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>CTA link</FormLabel>
                <FormControl>
                  <Input
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    placeholder="/contact"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Ticketed */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Ticketed event</p>
              <p className="text-xs text-muted-foreground">
                Turn on to show price label and ticketed badge.
              </p>
            </div>

            <FormField
              control={form.control}
              name="isTicketed"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Ticketed</Label>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>

          {isTicketed && (
            <FormField
              control={form.control}
              name="priceLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price label</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="$45 pp"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Sort order + Submit */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem className="md:max-w-xs">
                <FormLabel>Sort order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value as number}
                  />
                </FormControl>
                <FormDescription>
                  Lower comes first if same start time.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">
            {pending ? (
              <LoadingButton />
            ) : mode === "create" ? (
              "Create event"
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
