"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/global/ResponsiveModal";
import { useEffect, useState } from "react";
import CategoryForm from "./category/CategoryForm";
import CategoryActions from "./category/CategoryActions";
import { Badge } from "@/components/ui/badge";
import { useQueryStates } from "nuqs";
import { categoriesSelectParser } from "@/lib/searchParams/CategoriesSearchParams";

export function CategoriesNav({
  active,
  menuId,
  categories,
}: {
  active: string;
  menuId: string;
  categories: {
    id: string;
    name: string;
    slug: string;
    status: "ACTIVE" | "INACTIVE";
    description: string | null;
  }[];
}) {
  const [state, setState] = useQueryStates(categoriesSelectParser, {
    shallow: false,
  });

  return (
    <div className="space-y-4">
      {categories.length > 0 ? (
        <div className="md:hidden">
          <Select
            value={active}
            onValueChange={(v) => {
              setState({ section: v });
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((i) => (
                <SelectItem key={i.id} value={i.slug}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="flex  md:hidden flex-col gap-2 rounded-2xl border bg-card p-2 space-y-2 text-center">
          <Button>+ Create Category</Button>
          No Categories Found.
        </div>
      )}

      <CreateModal menuId={menuId} mode="create" />

      {categories.length > 0 ? (
        <nav className="hidden md:block rounded-2xl border bg-card p-2 space-y-2">
          {categories.map((i) => (
            <div className="flex" key={i.id}>
              <div
                onClick={() => setState({ section: i.slug })}
                className={cn(
                  " rounded-xl w-full px-3 py-2 text-sm transition flex items-center gap-4 cursor-pointer",
                  active === i.slug
                    ? "bg-primary/30 font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}>
                {i.name}
                {i.status === "ACTIVE" ? (
                  <Badge>ACTIVE</Badge>
                ) : (
                  <Badge variant="secondary">INACTIVE</Badge>
                )}
              </div>
              <CategoryActions id={i.id} item={i} menuId={menuId} />
            </div>
          ))}
        </nav>
      ) : (
        <div className="hidden  md:flex flex-col gap-4 rounded-2xl border bg-card p-2 space-y-2 text-center">
          No Categories Found.
        </div>
      )}
    </div>
  );
}

const CreateModal = ({
  menuId,
  mode,
}: {
  menuId: string;
  mode: "create" | "edit";
}) => {
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      trigger={<Button className="w-full">Create Category</Button>}>
      <CategoryForm
        setOpen={setOpen}
        menuId={menuId}
        mode={mode}></CategoryForm>
    </ResponsiveModal>
  );
};
