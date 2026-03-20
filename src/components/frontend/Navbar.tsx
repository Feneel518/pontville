"use client";

import { Menu, Stars, Waves, X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { IconRipple } from "@tabler/icons-react";
import { Button, buttonVariants } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Separator } from "../ui/separator";
import CartSheet from "./cart/CartSheet";
import { BookTableButton } from "../global/BookTableButton";
import HomeUserNavClient from "./home/HomeUserNavClient";
import { User } from "better-auth";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/authClient";
import { useRouter } from "next/navigation";

interface NavbarProps {
  restaurantDetails: {
    name: string;
    tagline: string | null;
    logoUrl: string | null;
  };
  user: User | undefined;
  allowedDashboard: boolean;
}

const nav = [
  { label: "Menu", href: "/menu" },
  { label: "Events", href: "/events" },
  { label: "Orders", href: "/orders" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
const mobileNav = [
  { label: "Menu", href: "/menu" },
  { label: "Events", href: "/events" },
  { label: "Orders", href: "/orders" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Bookings", href: "/booking" },
];

const Navbar: FC<NavbarProps> = ({
  restaurantDetails,
  allowedDashboard = false,
  user,
}) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function onLogout() {
    // ✅ Better Auth sign out
    await authClient.signOut();
    router.refresh();
    router.replace("/");
  }
  return (
    <header className="sticky  top-0 z-50   ">
      <div
        className={` h-20 md:h-20 pt-1 transition-all duration-500 ${isScrolled ? "bg-white/80 backdrop-blur-md" : "bg-transparent"}`}>
        <div
          className={`mx-auto max-w-[92%]  h-full  flex items-center justify-between gap-3  `}>
          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="relative size-14 md:size-14 lg:size-16 shrink-0 ">
              <Image
                src={restaurantDetails.logoUrl ?? "/logonew.svg"}
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

          {/* Center: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm text-foreground/70">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="px-3 py-2 rounded-md hover:text-foreground hover:bg-primary/20 transition whitespace-nowrap font-bold">
                {i.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop CTA */}
            <div className="hidden md:flex gap-4">
              <BookTableButton variant="elegant" />

              <CartSheet></CartSheet>

              {user ? (
                <HomeUserNavClient
                  canAccessDashboard={allowedDashboard}
                  user={user}></HomeUserNavClient>
              ) : (
                <Link
                  href={"/auth/login"}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-10",
                  )}>
                  Log In
                </Link>
              )}
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  showCloseButton={false}
                  side="right"
                  className="w-[88%] max-w-sm bg-background border-l p-0">
                  <SheetHeader className="h-16 px-4 flex-row items-center justify-between border-b">
                    <SheetTitle className="font-serif text-lg font-normal">
                      {restaurantDetails.name}
                    </SheetTitle>

                    <SheetClose asChild>
                      <Button variant="outline" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </SheetHeader>

                  <nav className="grid">
                    {mobileNav.map((l) => (
                      <SheetClose asChild key={l.href}>
                        <Link
                          href={l.href}
                          className="px-4 py-3 border-b hover:bg-primary/20 transition uppercase tracking-wider text-sm">
                          {l.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  <div className="p-4 space-y-2">
                    <Separator className="mb-4" />
                    <BookTableButton
                      trigger={
                        <Button variant={"outline"} className="w-full">
                          Book a Table
                        </Button>
                      }></BookTableButton>
                    <CartSheet className="w-full"></CartSheet>
                    {user ? (
                      <Button
                        variant={"outline"}
                        className="w-full"
                        onClick={onLogout}>
                        Logout{" "}
                      </Button>
                    ) : (
                      <Link
                        href={"/auth/login"}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "h-10",
                        )}>
                        Log In
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

{
  /* 
     
      <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden border-ivory/20 bg-ivory/5 hover:bg-ivory/10 text-ivory">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              showCloseButton={false}
              side="right"
              className="w-[86%] max-w-sm bg-background text-ivory border-l border-ivory/10 p-0">
              <SheetHeader className="h-16 px-4 flex-row items-center justify-between border-b border-ivory/10">
                <SheetTitle className="text-ivory font-sans tracking-[0.18em]">
                 The Crown Inn
                </SheetTitle>

                <SheetClose asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-ivory/20 bg-ivory/5 hover:bg-ivory/10 text-ivory">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </SheetHeader>

              <div className="px-4 py-5">
                <div className="flex items-center justify-between mb-4">
                  <Stars />
                  <span className="text-ivory/60 text-xs tracking-wider">
                    EST. 2010
                  </span>
                </div>

                <Separator className="bg-ivory/10 mb-4" />

                <nav className="grid gap-2">
                  {nav.map((l) => (
                    <SheetClose asChild key={l.href}>
                      <Link
                        href={l.href}
                        className="rounded-xl px-4 py-3 border border-ivory/15 bg-ivory/5 hover:bg-ivory/10 transition uppercase tracking-wider text-sm">
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="mt-6">
                  <Separator className="bg-ivory/10 mb-4" />
                  <div className="text-xs text-ivory/60 leading-relaxed">
                    <Button variant={"elegant"} className="">
                      Book a Table
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
      
      */
}
