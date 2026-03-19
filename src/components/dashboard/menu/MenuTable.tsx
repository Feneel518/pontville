"use client";

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { MoreHorizontal, Plus, Search } from "lucide-react";
// import React, { FC } from "react";
// import { format } from "date-fns";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { createMenuAction } from "@/lib/actions/dashboard/menu/createMenuAction";
// import { CreateMenuDialog } from "./createMenuDialog";

// interface MenuTableProps {
//   items: MenuRow[];
// }

// export type MenuStatus = "ACTIVE" | "INACTIVE";

// export type MenuRow = {
//   id: string;
//   name: string;
//   slug: string;
//   status: MenuStatus;
//   sortOrder: number;
//   updatedAt: Date;
//   restaurantId: string;
// };

// const MenuTable: FC<MenuTableProps> = ({ items }) => {
//   const [q, setQ] = React.useState("");
//   const [status, setStatus] = React.useState<MenuStatus | "ALL">("ALL");

//   const menuItems = React.useMemo(() => {
//     const qn = q.trim().toLowerCase();
//     return items
//       .filter((x) => (status === "ALL" ? true : x.status === status))
//       .filter((x) => {
//         if (!qn) return true;
//         return (
//           x.name.toLowerCase().includes(qn) || x.slug.toLowerCase().includes(qn)
//         );
//       })
//       .sort((a, b) => a.sortOrder - b.sortOrder);
//   }, [items, q, status]);
//   return (
//     <Card className="p-4">
//       {/* Toolbar */}
//       <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
//           <div className="relative w-full md:max-w-md">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="Search menus…"
//               className="pl-9"
//             />
//           </div>

//           <div className="flex items-center gap-2">
//             <Button
//               type="button"
//               variant={status === "ALL" ? "default" : "outline"}
//               onClick={() => setStatus("ALL")}>
//               All
//             </Button>
//             <Button
//               type="button"
//               variant={status === "ACTIVE" ? "default" : "outline"}
//               onClick={() => setStatus("ACTIVE")}>
//               Active
//             </Button>
//             <Button
//               type="button"
//               variant={status === "INACTIVE" ? "default" : "outline"}
//               onClick={() => setStatus("INACTIVE")}>
//               Inactive
//             </Button>
//           </div>
//         </div>

//         <CreateMenuDialog />
//       </div>

//       {/* Table */}
//       <div className="mt-4 overflow-x-auto rounded-lg border">
//         <table className="w-full text-sm">
//           <thead className="bg-muted/40">
//             <tr className="text-left">
//               <th className="px-4 py-3 font-medium">Menu</th>
//               <th className="px-4 py-3 font-medium">Slug</th>
//               <th className="px-4 py-3 font-medium">Status</th>
//               <th className="px-4 py-3 font-medium">Sort</th>
//               <th className="px-4 py-3 font-medium">Updated</th>
//               <th className="px-4 py-3 text-right font-medium">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length === 0 ? (
//               <tr>
//                 <td
//                   className="px-4 py-10 text-center text-muted-foreground"
//                   colSpan={6}>
//                   No menus found.
//                 </td>
//               </tr>
//             ) : (
//               items.map((row) => (
//                 <tr key={row.id} className="border-t">
//                   <td className="px-4 py-3 font-medium">{row.name}</td>
//                   <td className="px-4 py-3 text-muted-foreground">
//                     {row.slug}
//                   </td>
//                   <td className="px-4 py-3">
//                     <Badge
//                       variant={
//                         row.status === "ACTIVE" ? "default" : "secondary"
//                       }>
//                       {row.status}
//                     </Badge>
//                   </td>
//                   <td className="px-4 py-3">{row.sortOrder}</td>
//                   <td className="px-4 py-3 text-muted-foreground">
//                     {format(row.updatedAt, "MMM d, yyyy")}
//                   </td>
//                   <td className="px-4 py-3 text-right">
//                     <RowActions row={row} />
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <p className="mt-3 text-xs text-muted-foreground">
//         For now this page uses mock data. Next step: connect to Prisma with
//         server actions.
//       </p>
//     </Card>
//   );
// };
// export default MenuTable;

// /** UI-only create dialog */

// function RowActions({ row }: { row: MenuRow }) {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" size="icon" aria-label="Menu actions">
//           <MoreHorizontal className="h-4 w-4" />
//         </Button>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent align="end" className="w-44">
//         <EditMenuDialogTrigger row={row} />
//         <DropdownMenuSeparator />
//         <DropdownMenuItem
//           onClick={() => {
//             // TODO: toggleMenuStatusAction(row.id)
//             alert(`TODO: toggle status for ${row.name}`);
//           }}>
//           {row.status === "ACTIVE" ? "Disable" : "Enable"}
//         </DropdownMenuItem>
//         <DropdownMenuItem
//           className="text-destructive focus:text-destructive"
//           onClick={() => {
//             // TODO: soft delete
//             alert(`TODO: delete ${row.name}`);
//           }}>
//           Delete
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// /** UI-only edit dialog trigger inside dropdown */
// function EditMenuDialogTrigger({ row }: { row: MenuRow }) {
//   const [open, setOpen] = React.useState(false);

//   return (
//     <>
//       <DropdownMenuItem
//         onSelect={(e) => e.preventDefault()}
//         onClick={() => setOpen(true)}>
//         Edit
//       </DropdownMenuItem>

//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>Edit Menu</DialogTitle>
//           </DialogHeader>

//           <div className="grid gap-4">
//             <div className="grid gap-2">
//               <Label htmlFor={`name-${row.id}`}>Menu name</Label>
//               <Input id={`name-${row.id}`} defaultValue={row.name} />
//             </div>

//             <div className="grid gap-2">
//               <Label htmlFor={`slug-${row.id}`}>Slug</Label>
//               <Input id={`slug-${row.id}`} defaultValue={row.slug} />
//             </div>

//             <div className="grid gap-2">
//               <Label htmlFor={`sortOrder-${row.id}`}>Sort order</Label>
//               <Input
//                 id={`sortOrder-${row.id}`}
//                 type="number"
//                 defaultValue={row.sortOrder}
//               />
//             </div>

//             <div className="flex items-center justify-end gap-2 pt-2">
//               <Button variant="outline" onClick={() => setOpen(false)}>
//                 Cancel
//               </Button>
//               <Button
//                 onClick={() => {
//                   // TODO: updateMenuAction
//                   alert(`TODO: updateMenuAction(${row.id})`);
//                   setOpen(false);
//                 }}>
//                 Save changes
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

export type MenuStatus = "ACTIVE" | "INACTIVE";

export type MenuRow = {
  id: string;
  name: string;
  slug: string;
  status: MenuStatus;
  sortOrder: number;
  updatedAt: Date;
  restaurantId: string;
  imageUrl: string | null;
  description: string | null;
  categories: {
    id: string;
    slug: string;
  }[];
  openingHours: MenuOpeningHour[];
};

import { menuParsers, menuQP } from "@/lib/searchParams/MenuSearchParams";
import { FC, useEffect, useState } from "react";
import { useQueryStates } from "nuqs";
import { Card } from "@/components/ui/card";
import MenuToolbar from "./MenuToolbar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import MenuActions from "./MenuActions";
import { MenuOpeningHour } from "@prisma/client";
interface MenuTableProps {
  items: MenuRow[];
  total: number;
  page: number;
  pageSize: number;
  qp: menuQP;
}

const MenuTable: FC<MenuTableProps> = ({
  items,
  page,
  pageSize,
  qp,
  total,
}) => {
  const [, setState] = useQueryStates(menuParsers, {
    shallow: false,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const clampPage = (n: number) => Math.min(totalPages, Math.max(1, n));

  const [pageInput, setPageInput] = useState<string>(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const commitPage = (row: string) => {
    const n = Number(row);
    if (!Number.isFinite(n)) {
      setPageInput(String(n));
      return;
    }

    const next = clampPage(Math.trunc(n));
    setPageInput(String(next));

    if (next !== page) setState({ page: next });
  };

  return (
    <Card className="p-4">
      {/* Toolbar */}
      <MenuToolbar qp={qp}></MenuToolbar>
      
      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <Table className="p-4">
          <TableHeader>
            <TableRow>
              <TableHead className="">Menu</TableHead>
              <TableHead>Status</TableHead>

              <TableHead>Updated At</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground">
                  No menu found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="">
                      <Link
                        className="hover:underline"
                        href={`/dashboard/menu/${c.id}${c.categories.length > 0 ? `?section=${c.categories[0].slug}` : ""}`}>
                        {c.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.status === "ACTIVE" ? (
                      <Badge>ACTIVE</Badge>
                    ) : (
                      <Badge variant="secondary">INACTIVE</Badge>
                    )}
                  </TableCell>

                  <TableCell>{format(c.updatedAt, "PPP")}</TableCell>

                  <TableCell className="text-right">
                    <MenuActions id={c.id} item={c} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between ">
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!canPrev}
            onClick={() => setState({ page: page - 1 })}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1">
            <span className="text-sm text-muted-foreground">Page</span>

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
                    setPageInput(String(page));
                  }
                }}
                aria-label="Go to page"
              />
            </div>

            <span className="text-sm text-muted-foreground">
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
            onClick={() => setState({ page: page + 1 })}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MenuTable;
