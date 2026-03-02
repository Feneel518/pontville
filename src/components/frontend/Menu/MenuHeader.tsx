import Image from "next/image";
import { FC } from "react";

import SectionComponent from "@/components/global/SectionComponent";
import ArrowButton from "@/components/ui/ArrowButton";
import Heading from "@/components/global/Heading";
import { prisma } from "@/lib/prisma/db";
import Link from "next/link";

interface MenuHeaderProps {}

const MenuHeader: FC<MenuHeaderProps> = async ({}) => {
  const menu = await prisma.menu.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const pattern = [
    { height: "h-[350px]", align: "" },
    { height: "h-[500px]", align: "" },
    { height: "h-[400px]", align: "place-self-end w-full" },
    { height: "h-[400px]", align: "" },
  ];

  if (!menu) {
    return (
      <SectionComponent className="text-center">
        <Heading
          label="No Menus found"
          className="text-wrap leading-tight"></Heading>
      </SectionComponent>
    );
  }

  return (
    <SectionComponent>
      <Heading label="Our Menu" className="text-wrap leading-tight"></Heading>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative max-md:mb-20 ">
        {menu.map((me, index) => {
          const group = Math.floor(index / 4);
          const isReversed = group % 2 === 1;
          const position = index % 4;
          const layoutIndex = isReversed ? 3 - position : position;

          const layout = pattern[layoutIndex];
          return (
            <Link
              key={me.id}
              href={`/menu/${me.id}`}
              className={`group transition-all duration-200 ease-in-out ${layout.align}`}>
              <div
                key={index}
                className={`${layout.height} max-md:h-[350px] w-full relative overflow-hidden  }`}>
                <Image
                  src={me.imageUrl!}
                  alt={me.name}
                  fill
                  className="object-cover group-hover:scale-[102%] transition-all duration-500 ease-in-out"></Image>
              </div>
              <div className="md:hidden">{me.name}</div>
              <div className="font-serif max-md:mt-4 md:block hidden ">
                <ArrowButton direction="right" label={me.name}></ArrowButton>
              </div>
            </Link>
          );
        })}

        <div className="absolute lg:right-0 bottom-0 max-lg:-bottom-12">
          <ArrowButton
            href="/menu/full-menu"
            direction="right"
            label="Full Menu"></ArrowButton>
        </div>
      </div>
    </SectionComponent>
  );
};

export default MenuHeader;
