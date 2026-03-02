import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { FC, useState, useTransition } from "react";

import { MenuRow } from "./MenuTable";
import { ResponsiveModal } from "@/components/global/ResponsiveModal";
import MenuForm from "./MenuForm";
import { toggleMenuStatusAction } from "@/lib/actions/dashboard/menu/toggleMenuStatusAction";

interface MenuActionsProps {
  id: string;
  item: MenuRow;
}

const MenuActions: FC<MenuActionsProps> = ({ id, item }) => {
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
          <MenuForm setOpen={setOpen} mode="edit" initial={item}></MenuForm>
        </ResponsiveModal>
        <DropdownMenuItem>
          <div
            className="text-center w-full "
            onClick={async () => {
              toggleMenuStatusAction({ id: item.id });
            }}>
            {item.status === "ACTIVE" ? "Set Inactive" : "Set Active"}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MenuActions;
