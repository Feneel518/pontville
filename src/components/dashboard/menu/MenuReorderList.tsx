"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { reorderMenusAction } from "@/lib/actions/dashboard/menu/reorderMenusAction";
import { cn } from "@/lib/utils";
import type { MenuRow } from "./MenuTable";

interface MenuReorderListProps {
  items: MenuRow[];
}

type SortableMenu = MenuRow & {
  sortOrder: number;
};

function SortableMenuRow({ item }: { item: SortableMenu }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 rounded-xl border bg-background px-4 py-3 shadow-sm transition",
          isDragging && "z-10 scale-[1.01] shadow-md",
        )}>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground transition hover:bg-muted active:cursor-grabbing"
          aria-label={`Drag ${item.name}`}>
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <p className="truncate font-medium">{item.name}</p>
          <p className="truncate text-sm text-muted-foreground">/{item.slug}</p>
        </div>

        <div className="flex items-center gap-2">
          {item.status === "ACTIVE" ? (
            <Badge>ACTIVE</Badge>
          ) : (
            <Badge variant="secondary">INACTIVE</Badge>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          {format(item.updatedAt, "PPP")}
        </div>
      </div>
    </div>
  );
}

export default function MenuReorderList({ items }: MenuReorderListProps) {
  const initialItems = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items],
  );

  const [menus, setMenus] = useState<SortableMenu[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = menus.findIndex((m) => m.id === active.id);
    const newIndex = menus.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(menus, oldIndex, newIndex).map((item, index) => ({
      ...item,
      sortOrder: index,
    }));

    setMenus(next);

    startTransition(async () => {
      await reorderMenusAction(next.map((item) => item.id));
    });
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Reorder menus</h2>
          <p className="text-sm text-muted-foreground">
            Drag and drop to change the display order of menus.
          </p>
        </div>

        <Button variant="outline" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Auto-saving"
          )}
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <div>Move</div>
        <div>Menu</div>
        <div>Status</div>
        <div>Updated</div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}>
        <SortableContext
          items={menus.map((m) => m.id)}
          strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {menus.map((item) => (
              <SortableMenuRow key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Card>
  );
}
