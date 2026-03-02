import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { FC, useState, useTransition } from "react";

import { ResponsiveModal } from "@/components/global/ResponsiveModal";

import { toggleMenuStatusAction } from "@/lib/actions/dashboard/menu/toggleMenuStatusAction";
import { Category } from "@prisma/client";
import CategoryForm from "./CategoryForm";
import { toggleCategoryStatusAction } from "@/lib/actions/dashboard/menu/category/toggleCategoryStatusAction";

interface CategoryActionsProps {
  id: string;
  item: Partial<Category>;
  menuId: string;
}

const CategoryActions: FC<CategoryActionsProps> = ({ id, item, menuId }) => {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={pending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* <CreateMenuDialog mode="edit" initial={item}></CreateMenuDialog> */}
        <ResponsiveModal
          onOpenChange={setOpen}
          open={open}
          trigger={
            <Button variant={"outline"} className="w-full">
              {" "}
              Edit Menu
            </Button>
          }>
          <CategoryForm
            menuId={menuId}
            setOpen={setOpen}
            mode="edit"
            initial={item}></CategoryForm>
        </ResponsiveModal>
        <DropdownMenuItem>
          <div
            className="text-center w-full "
            onClick={async () => {
              toggleCategoryStatusAction({ id: item.id! });
            }}>
            {item.status === "ACTIVE" ? "Set Inactive" : "Set Active"}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryActions;
