import { prisma } from "@/lib/prisma/db";
import { IconRipple } from "@tabler/icons-react";
import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FC } from "react";

interface layoutProps {
  children: React.ReactNode;
}

const layout: FC<layoutProps> = async ({ children }) => {
  const restaurantDetails = await prisma.restaurant.findFirst({
    select: {
      logoUrl: true,
      name: true,
      tagline: true,
    },
  });

  if (!restaurantDetails) redirect("/");
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="relative size-14 md:size-14 lg:size-16 shrink-0 ">
              <Image
                src={restaurantDetails?.logoUrl ?? "/logonew.svg"}
                alt={restaurantDetails.name}
                fill
                priority
                className="object-contain"
              />
            </div>

            <div className="min-w-0 leading-tight -ml-4">
              <p className="font-serif tracking-tight  text-xl sm:text-xl md:text-2xl lg:text-[30px] truncate">
                {restaurantDetails.name}
              </p>

              <p className="font-sans tracking-widest text-[10px] -mt-2 sm:text-[11px] md:text-xs text-foreground/70 flex items-center gap-2">
                <span className="truncate ml-1">
                  {restaurantDetails.tagline}
                </span>
                <IconRipple strokeWidth={0.75} className="shrink-0" />
              </p>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/hotelFront.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default layout;
