import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import ArrowButton from "@/components/ui/ArrowButton";
import { prisma } from "@/lib/prisma/db";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

interface OurMenuProps {}

const OurMenu: FC<OurMenuProps> = async () => {
  const menu = await prisma.menu.findMany({
    take: 3,
    orderBy: { name: "asc" },
  });

  if (!menu.length) return null; // or show placeholder section

  return (
    <SectionComponent className="relative flex flex-col gap-12">
      <Heading label="Our Menu" />

      <div className="relative grid gap-6 md:grid-cols-10 md:gap-12">
        {menu.length === 1 && (
          <MenuCard
            className="md:col-span-10"
            title={menu[0].name}
            img={menu[0].imageUrl ?? "/placeholder.png"}
            href={`/menu/${menu[0].id}`}
          />
        )}

        {menu.length === 2 && (
          <>
            <MenuCard
              className="md:col-span-6"
              title={menu[0].name}
              img={menu[0].imageUrl ?? "/placeholder.png"}
              href={`/menu/${menu[0].id}`}
            />
            <MenuCard
              className="md:col-span-4"
              title={menu[1].name}
              img={menu[1].imageUrl ?? "/placeholder.png"}
              small
              href={`/menu/${menu[1].id}`}
            />
          </>
        )}

        {menu.length >= 3 && (
          <>
            <MenuCard
              className="md:col-span-4"
              title={menu[0].name}
              img={menu[0].imageUrl ?? "/placeholder.png"}
              href={`/menu/${menu[0].id}`}
            />
            <MenuCard
              className="md:col-span-3"
              title={menu[1].name}
              img={menu[1].imageUrl ?? "/placeholder.png"}
              small
              href={`/menu/${menu[1].id}`}
            />
            <MenuCard
              className="md:col-span-3"
              title={menu[2].name}
              img={menu[2].imageUrl ?? "/placeholder.png"}
              small
              href={`/menu/${menu[2].id}`}
            />
          </>
        )}

        <div className="absolute -bottom-16   right-0 hidden md:flex">
          <ArrowButton href="/menu" direction="right" label="Full Menu" />
        </div>
      </div>

      <div className="md:hidden ml-2 mb-20">
        <ArrowButton href="/menu" direction="right" label="Full Menu" />
      </div>
    </SectionComponent>
  );
};
export default OurMenu;

function MenuCard({
  title,
  img,
  href,
  small,
  className = "",
}: {
  title: string;
  img: string;
  href: string;
  small?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden ring-1 ring-white/10 transition-all duration-500 hover:ring-white/30",
        className,
      ].join(" ")}>
      <div
        className={[
          "relative w-full rounded-sm overflow-hidden max-h-[600px]",
          small ? "aspect-6/4" : "aspect-4/3 md:aspect-5/4", // controlled ratio
        ].join(" ")}>
        <Image
          src={img}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-LINER-to-t from-black/60 via-black/10 to-transparent" />

        <p className="absolute bottom-4 left-4 text-white md:text-lg font-medium tracking-wide">
          {title}
        </p>
      </div>
    </Link>
  );
}
