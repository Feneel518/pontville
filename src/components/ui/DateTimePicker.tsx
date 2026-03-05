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

export function DateTimePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
}) {
  const [date, setDate] = React.useState<Date | undefined>(value);

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

  function handleTimeChange(time: string) {
    if (!date) return;

    const [hours, minutes] = time.split(":").map(Number);
    const updated = setHours(setMinutes(date, minutes), hours);

    setDate(updated);
    onChange(updated);
  }

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-[200px]",
              !date && "text-muted-foreground",
            )}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Select onValueChange={handleTimeChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Time" />
        </SelectTrigger>

        <SelectContent
          position="popper"
          className="max-h-64 overflow-y-auto overscroll-contain"
          onWheelCapture={(e) => e.stopPropagation()}
          onTouchMoveCapture={(e) => e.stopPropagation()}>
          {generateTimeSlots().map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function generateTimeSlots() {
  const times: string[] = [];
  for (let hour = 10; hour <= 22; hour++) {
    for (let minute of [0, 30]) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      times.push(`${h}:${m}`);
    }
  }
  return times;
}
