"use client";

import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TimeSlot = {
  value: string; // "23:30"
  label: string; // "11:30 PM"
};

export function DateTimePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
}) {
  const [date, setDate] = React.useState<Date | undefined>(value);

  const slots = React.useMemo(
    () =>
      generateTimeSlots({
        startHour: 11,
        endHour: 20,
        interval: 30,
      }),
    [],
  );

  function handleDateChange(d: Date | undefined) {
    if (!d) return;

    if (!date) {
      setDate(d);
      onChange(d);
      return;
    }

    const updated = setHours(setMinutes(d, date.getMinutes()), date.getHours());
    setDate(updated);
    onChange(updated);
  }

  function handleTimeChange(time24: string) {
    if (!date) return;

    const [hours, minutes] = time24.split(":").map(Number);
    const updated = setHours(setMinutes(date, minutes), hours);

    setDate(updated);
    onChange(updated);
  }

  const selectedTimeValue = date
    ? `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes(),
      ).padStart(2, "0")}`
    : undefined;

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-full sm:w-[220px]",
              !date && "text-muted-foreground",
            )}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Select value={selectedTimeValue} onValueChange={handleTimeChange}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Time" />
        </SelectTrigger>

        <SelectContent
          position="popper"
          className="max-h-64 overflow-y-auto overscroll-contain"
          onWheelCapture={(e) => e.stopPropagation()}
          onTouchMoveCapture={(e) => e.stopPropagation()}>
          {slots.map((slot) => (
            <SelectItem key={slot.value} value={slot.value}>
              {slot.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function generateTimeSlots({
  startHour = 11,
  endHour = 23,
  interval = 30,
}: {
  startHour?: number;
  endHour?: number;
  interval?: number;
} = {}): TimeSlot[] {
  const times: TimeSlot[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0",
      )}`;

      times.push({
        value,
        label: formatTo12Hour(hour, minute),
      });
    }
  }

  return times;
}

function formatTo12Hour(hour: number, minute: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}
