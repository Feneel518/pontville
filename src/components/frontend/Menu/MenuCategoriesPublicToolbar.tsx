"use client";

import { categoriesSelectParser } from "@/lib/searchParams/CategoriesMainPageSearchParams";
import { useQueryStates } from "nuqs";
import { FC } from "react";

interface MenuCategoriesPublicToolbarProps {
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  selected: string | undefined;
}

const MenuCategoriesPublicToolbar: FC<MenuCategoriesPublicToolbarProps> = ({
  categories,
  selected,
}) => {
  const [state, setState] = useQueryStates(categoriesSelectParser, {
    shallow: false,
  });

  return (
    <div className="flex gap-8 md:gap-20 font-serif flex-wrap">
      {categories.map((cate) => {
        const isActive = selected ? selected === cate.id : categories[0].id;
        return (
          <div
            key={cate.id}
            className={`text-xl cursor-pointer ${isActive ? "underline text-primary" : ""} `}
            onClick={() => setState({ category: cate.slug })}>
            • {cate.name}
          </div>
        );
      })}
    </div>
  );
};

export default MenuCategoriesPublicToolbar;
