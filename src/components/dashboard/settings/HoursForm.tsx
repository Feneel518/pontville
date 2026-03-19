"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  hoursEditorSchema,
  weekdayEnum,
  type HoursEditorInput,
} from "@/lib/validators/settingsValidator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateHoursAction } from "@/lib/actions/dashboard/settings/updateHorsAction";
import { Checkbox } from "@/components/ui/checkbox";

const WEEKDAYS = weekdayEnum.options; // ["MON","TUE",...,"SUN"]

const weekdayLabel: Record<(typeof WEEKDAYS)[number], string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function HoursForm({
  defaultValues,
}: {
  defaultValues: HoursEditorInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<HoursEditorInput>({
    resolver: zodResolver(hoursEditorSchema) as any,
    defaultValues,
  });

  const onSubmit = (values: HoursEditorInput) => {
    startTransition(async () => {
      const res = await updateHoursAction(values);
      if (!res.ok) {
        toast.error("Something went wrong, updating the venue form.");
      }

      toast.success("Your settings were updated.");
      router.refresh();
    });
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Trading Hours</CardTitle>
        <CardDescription>
          These show on your website for easy planning.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <Row
              label="Bar & keno"
              name="bar"
              placeholder="10:00 - 21:00"
              control={form.control}
            />
            <Row
              label="Bistro Lunch"
              name="bistroLunch"
              placeholder="10:00 - 21:00"
              control={form.control}
            />
            <Row
              label="Bistro Dinner"
              name="bistroDinner"
              placeholder="10:00 - 21:00"
              control={form.control}
            />

            <Row
              label="Tea"
              name="tea"
              placeholder="10:00 - 21:00"
              control={form.control}
            />

            {/* Weekly holidays */}
            <FormField
              control={form.control}
              name="weeklyHolidays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly holidays</FormLabel>
                  <FormDescription>
                    Select days when takeaway should be closed (e.g. every
                    Sunday).
                  </FormDescription>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {WEEKDAYS.map((day) => {
                      const checked = field.value?.includes(day);

                      return (
                        <label
                          key={day}
                          className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/40">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const isChecked = v === true;
                              const next = isChecked
                                ? Array.from(
                                    new Set([...(field.value ?? []), day]),
                                  )
                                : (field.value ?? []).filter((x) => x !== day);

                              field.onChange(next);
                            }}
                          />
                          <span className="text-sm font-medium">
                            {weekdayLabel[day]}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Eg. Public holidays hours may vary…"
                      className="min-h-[90px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  name,
  placeholder,
  control,
}: {
  label: string;
  name:
    | "bar"
    | "bistroLunch"
    | "bistroDinner"
    | "pizzaLunch"
    | "pizzaDinner"
    | "tea";
  placeholder: string;
  control: any;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: any) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
