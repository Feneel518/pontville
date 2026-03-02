"use client";

import { ResponsiveModal } from "@/components/global/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounce";
import {
  MenuItemIsAvailable,
  menuItemParsers,
  menuItemQP,
  MenuItemStatus,
  MenuSort,
} from "@/lib/searchParams/MenuItemSearchParams";
import { MenuItem } from "@prisma/client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { FC, useEffect, useState } from "react";
import MenuItemForm from "./MenuItemForm";

interface MenuItemToolbarProps {
  qp: menuItemQP;
  categoryId: string;
  total: number;
  pageParams: number;
  pageSizeParams: number;
}

const MenuItemToolbar: FC<MenuItemToolbarProps> = ({
  qp,
  categoryId,
  total,
  pageParams,
  pageSizeParams,
}) => {
  const [state, setState] = useQueryStates(menuItemParsers, {
    shallow: false,
  });

  const [openModal, setOpenModal] = useState(false);

  const [search, setSearch] = useState(state.q ?? "");

  const debouncedSearch = useDebouncedValue(search, 500);

  const totalPages = Math.max(1, Math.ceil(total / pageSizeParams));
  const canPrev = pageParams > 1;
  const canNext = pageParams < totalPages;

  const [pageInput, setPageInput] = useState<string>(String(pageParams));

  const clampPage = (n: number) => Math.min(totalPages, Math.max(1, n));

  const commitPage = (row: string) => {
    const n = Number(row);
    if (!Number.isFinite(n)) {
      setPageInput(String(n));
      return;
    }

    const next = clampPage(Math.trunc(n));
    setPageInput(String(next));

    if (next !== pageParams) setState({ page: next });
  };

  useEffect(() => {
    setState({ q: debouncedSearch, page: 1 });
  }, [debouncedSearch]);

  const activeFilters =
    (qp?.q ? 1 : 0) +
    (qp?.status !== "ALL" ? 1 : 0) +
    (qp.available !== "ALL" ? 1 : 0);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center max-md:grid max-md:grid-cols-2">
        <Input
          className="w-40"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name / slug / description "
        />

        <Select
          value={state.status ?? "ALL"}
          onValueChange={(v) => setState({ status: v as any, page: 1 })}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {MenuItemStatus.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={state.available ?? "ALL"}
          onValueChange={(v) => setState({ status: v as any, page: 1 })}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Available" />
          </SelectTrigger>
          <SelectContent>
            {MenuItemIsAvailable.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={`${state.sort ?? "createdAt"}:${state.dir ?? "desc"}`}
          onValueChange={(v) => {
            const [sort, dir] = v.split(":");
            setState({ sort: sort as any, dir: dir as any, page: 1 });
          }}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {MenuSort.map((s) => (
              <div key={s}>
                <SelectItem key={`${s}-asc`} value={`${s}:asc`}>
                  Sort: {s} (asc)
                </SelectItem>
                <SelectItem key={`${s}-desc`} value={`${s}:desc`}>
                  Sort: {s} (desc)
                </SelectItem>
              </div>
            ))}
          </SelectContent>
        </Select>

        {activeFilters > 0 && (
          <Button
            variant="outline"
            onClick={() =>
              setState({
                q: "",
                status: "ALL",
                sort: "createdAt",
                dir: "desc",
                page: 1,
              })
            }>
            <X className="mr-2 h-4 w-4" />
            Reset ({activeFilters})
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!canPrev}
            onClick={() => setState({ page: pageParams - 1 })}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center flex-nowrap gap-2 rounded-lg border bg-background px-2">
            <div className="w-6">
              <Input
                className="bg-transparent  p-0 pl-2 border-none "
                inputMode="numeric"
                pattern="[0-9]*"
                value={pageInput}
                onChange={(e) => {
                  // allow empty while typing; strip non-digits
                  const v = e.target.value.replace(/[^\d]/g, "");
                  setPageInput(v);
                }}
                onBlur={() => commitPage(pageInput)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitPage(pageInput);
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setPageInput(String(pageParams));
                  }
                }}
                aria-label="Go to page"
              />
            </div>

            <span className="text-sm text-muted-foreground  ">
              / {totalPages}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => commitPage(pageInput)}
              className="h-8">
              Go
            </Button>
          </div>
          <Button
            variant="outline"
            disabled={!canNext}
            onClick={() => setState({ page: pageParams + 1 })}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* <CreateMenuDialog mode="create"></CreateMenuDialog> */}
      <ResponsiveModal
        onOpenChange={setOpenModal}
        open={openModal}
        trigger={<Button>+ New Item</Button>}>
        <MenuItemForm
          mode="create"
          setOpen={setOpenModal}
          categoryId={categoryId}></MenuItemForm>
      </ResponsiveModal>
    </div>
  );
};

export default MenuItemToolbar;
