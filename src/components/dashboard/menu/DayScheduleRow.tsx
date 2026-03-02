import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { WEEK_DAYS } from "@/lib/constants/Weekdays";
import { CreateMenuInput } from "@/lib/validators/menuValidator";
import { Plus, Trash2 } from "lucide-react";
import { FC } from "react";
import { Control, useFieldArray } from "react-hook-form";

interface DayScheduleRowProps {
  form: any;
  day: (typeof WEEK_DAYS)[number];
  dayIndex: number;
}

const DayScheduleRow: FC<DayScheduleRowProps> = ({ day, dayIndex, form }) => {
  const slotsArray = useFieldArray({
    control: form.control,
    name: `schedules.${dayIndex}.slots`,
  });
  const isClosed = form.watch(`schedules.${dayIndex}.isClosed`);

  

  const dayLabel = day.charAt(0) + day.slice(1).toLowerCase().replace("_", " ");
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium">{dayLabel}</div>

        <FormField
          control={form.control}
          name={`schedules.${dayIndex}.isClosed`}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormLabel className="text-sm text-muted-foreground">
                Closed
              </FormLabel>
              <FormControl>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={(v) => {
                    field.onChange(v);

                    // If closing the day -> clear slots
                    if (v) {
                      slotsArray.replace([]);
                    } else {
                      // If opening the day -> ensure at least 1 slot
                      if (slotsArray.fields.length === 0) {
                        slotsArray.append({
                          openTime: "09:00",
                          closeTime: "22:00",
                        });
                      }
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* hidden day field (keeps data consistent) */}
      <input
        type="hidden"
        {...form.register(`schedules.${dayIndex}.day`)}
        value={day}
      />

      {isClosed ? (
        <div className="mt-3 text-sm text-muted-foreground">
          Closed for the day
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {slotsArray.fields.map((slot: any, slotIndex: number) => (
            <div key={slot.id} className="grid gap-3 md:grid-cols-5">
              <FormField
                control={form.control}
                name={`schedules.${dayIndex}.slots.${slotIndex}.openTime`}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs">Open</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`schedules.${dayIndex}.slots.${slotIndex}.closeTime`}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs">Close</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => slotsArray.remove(slotIndex)}
                  disabled={slotsArray.fields.length === 1}
                  title="Remove slot">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                slotsArray.append({ openTime: "19:00", closeTime: "23:00" })
              }
              className="gap-2">
              <Plus className="h-4 w-4" />
              Add slot
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayScheduleRow;
