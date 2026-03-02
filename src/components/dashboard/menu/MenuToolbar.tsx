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
  menuParsers,
  menuQP,
  MenuSort,
  MenuStatus,
} from "@/lib/searchParams/MenuSearchParams";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { FC, useEffect, useState } from "react";
import MenuForm from "./MenuForm";

interface MenuToolbarProps {
  qp: menuQP;
}

const MenuToolbar: FC<MenuToolbarProps> = ({ qp }) => {
  const [state, setState] = useQueryStates(menuParsers, {
    shallow: false,
  });

  const [openModal, setOpenModal] = useState(false);

  const [search, setSearch] = useState(state.q ?? "");

  const debouncedSearch = useDebouncedValue(search, 500);

  useEffect(() => {
    setState({ q: debouncedSearch, page: 1 });
  }, [debouncedSearch]);

  const activeFilters = (qp?.q ? 1 : 0) + (qp?.status !== "ALL" ? 1 : 0);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center max-md:grid max-md:grid-cols-2">
        <Input
          className="md:max-w-sm"
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
            {MenuStatus.map((s) => (
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
          <SelectTrigger className="w-full md:w-[220px]">
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
      </div>

      {/* <CreateMenuDialog mode="create"></CreateMenuDialog> */}
      <ResponsiveModal
        onOpenChange={setOpenModal}
        open={openModal}
        trigger={<Button>+ New Menu</Button>}>
        <MenuForm mode="create" setOpen={setOpenModal}></MenuForm>
      </ResponsiveModal>
    </div>
  );
};

export default MenuToolbar;
