"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { z } from "zod";
import {
  CreateInquiryInput,
  createInquirySchema,
  createTableInquirySchema,
} from "@/lib/validators/InquiryValidator";
import { createInquiryAction } from "@/lib/actions/frontend/createInquiry";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DateTimePicker } from "../ui/DateTimePicker";

type FormValues = z.infer<typeof createTableInquirySchema>;

function toDateOrThrow(v: unknown) {
  // from <input type="datetime-local"> you get a string "YYYY-MM-DDTHH:mm"
  if (typeof v !== "string" || !v.trim())
    throw new Error("Please choose date & time");
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date/time");
  return d;
}

export function BookTableForm({
  onSuccess,
  eventType = "TABLE",
}: {
  onSuccess?: () => void;
  eventType?: "EVENT" | "TABLE";
}) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<CreateInquiryInput>({
    resolver: zodResolver(createInquirySchema) as any,
    defaultValues: {
      type: eventType,
      name: "",
      email: "",
      phone: "",
      notes: "",
      // TABLE
      guests: 2,
      bookingAt: undefined as any,
      // EVENT
      eventType: "",
      eventDate: undefined as any,
      expectedGuests: undefined as any,
      budget: undefined as any,
    } as any,
  });

  const type = form.watch("type");
  const date = form.watch("bookingAt");

  async function onSubmit(values: CreateInquiryInput) {
    try {
      setLoading(true);

      // Convert datetime-local string -> Date for TABLE / EVENT date
      const payload: CreateInquiryInput = { ...values };

      await createInquiryAction(payload);

      toast.success("Inquiry sent! We'll get back to you soon.");
      onSuccess?.();
      form.reset({
        ...form.getValues(),
        name: "",
        email: "",
        phone: "",
        notes: "",
      } as any);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send inquiry");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inquiry type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose inquiry type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="TABLE">Table booking</SelectItem>
                  <SelectItem value="EVENT">Event inquiry</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose “Event” for birthdays, engagements, corporate, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contact */}
        <div className="grid gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="name@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="+61…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* TABLE fields */}
        {type === "TABLE" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guests</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={field.value as any}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bookingAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          /* EVENT fields */
          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Event type</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Birthday / Engagement / Corporate…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event date (optional)</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedGuests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected guests (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      value={(field.value as any) ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={(field.value as any) ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Any special request…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={loading} type="submit" className="w-full">
          {loading ? "Sending…" : "Send inquiry"}
        </Button>
      </form>
    </Form>
  );
}
