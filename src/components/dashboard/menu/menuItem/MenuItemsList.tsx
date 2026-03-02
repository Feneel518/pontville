import MenuItemCardFrontend from "@/components/frontend/Menu/MenuItemCardFrontend";
import Heading from "@/components/global/Heading";
import { cn } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { FC } from "react";

interface MenuItemsListProps {
  items:
    | Prisma.MenuItemGetPayload<{
        include: {
          addOnGroups: {
            include: {
              addOns: true;
            };
          };
          variants: true;
        };
      }>[]
    | undefined;
  categoryName: string | undefined;
  categorySlug: string | undefined;
  menuId: string;
  open: {
    isOpen: boolean;
    closesAt?: string;
    opensAt?: string;
  };
}

const MenuItemsList: FC<MenuItemsListProps> = ({
  items,
  categoryName,
  menuId,
  open,
  categorySlug,
}) => {
  if (items?.length === 0) {
    return <div className="">No Items found</div>;
  }
  return (
    <div>
      <Heading label={categoryName!}></Heading>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid-rows-3 gap-8 ">
        {items?.map((item, index) => {
          return (
            <div key={item.id} className={cn(" ")}>
              <MenuItemCardFrontend
                open={open}
                menuId={menuId}
                categorySlug={categorySlug!}
                key={item.id}
                item={item}></MenuItemCardFrontend>
             
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuItemsList;
