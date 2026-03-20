"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import {
  IconLayoutDashboard,
  IconRipple,
  IconShoppingCart,
  IconUserCircle,
} from "@tabler/icons-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((x) => x[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  async function onLogout() {
    try {
      const res = await authClient.signOut();

      if (res?.error) {
        console.error("Logout failed:", res.error);
        return;
      }

      setMobileOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <header className="sticky top-0 z-50">
      <div
        className={cn(
          "h-20 pt-1 transition-all duration-500",
          isScrolled ? "bg-white/80 backdrop-blur-md" : "bg-transparent",
        )}>
        <div className="mx-auto max-w-[92%] h-full flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="relative size-14 md:size-14 lg:size-16 shrink-0">
              <Image
                src={restaurantDetails.logoUrl ?? "/logonew.svg"}
                alt={restaurantDetails.name}
                fill
                priority
                className="object-contain"
              />
            </div>

            <div className="min-w-0 leading-tight -ml-4">
              <p className="font-serif tracking-tight text-xl sm:text-xl md:text-2xl lg:text-[30px] truncate">
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

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex gap-4">
              <BookTableButton variant="elegant" />
              <CartSheet />
              {user ? (
                <HomeUserNavClient
                  canAccessDashboard={allowedDashboard}
                  user={user}
                />
              ) : (
                <Link
                  href="/auth/login"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-10",
                  )}>
                  Log In
                </Link>
              )}
            </div>

            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  showCloseButton={false}
                  side="right"
                  className="w-[88%] max-w-sm bg-background border-l p-0 flex flex-col">
                  <SheetHeader className="h-16 px-4 flex-row items-center justify-between border-b">
                    <div className="min-w-0 text-left">
                      <SheetTitle className="font-serif text-lg font-normal truncate">
                        {restaurantDetails.name}
                      </SheetTitle>
                      {restaurantDetails.tagline ? (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {restaurantDetails.tagline}
                        </p>
                      ) : null}
                    </div>

                    <SheetClose asChild>
                      <Button variant="outline" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto">
                    {user ? (
                      <div className="px-4 py-4 border-b">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage
                              src={user.image ?? ""}
                              alt={user.name}
                            />
                            <AvatarFallback className="rounded-lg">
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}

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

                    <div className="p-4 space-y-3">
                      <Separator className="mb-1" />

                      <BookTableButton
                        trigger={
                          <Button variant="outline" className="w-full">
                            Book a Table
                          </Button>
                        }
                      />

                      <CartSheet className="w-full" />

                      {user ? (
                        <>
                          <SheetClose asChild>
                            <Link
                              href="/orders"
                              className={cn(
                                buttonVariants({ variant: "outline" }),
                                "w-full justify-start",
                              )}>
                              <IconShoppingCart className="mr-2 size-4" />
                              Orders
                            </Link>
                          </SheetClose>

                          <SheetClose asChild>
                            <Link
                              href="/booking"
                              className={cn(
                                buttonVariants({ variant: "outline" }),
                                "w-full justify-start",
                              )}>
                              <IconUserCircle className="mr-2 size-4" />
                              My Bookings
                            </Link>
                          </SheetClose>

                          {allowedDashboard ? (
                            <SheetClose asChild>
                              <Link
                                href="/dashboard"
                                className={cn(
                                  buttonVariants({ variant: "outline" }),
                                  "w-full justify-start",
                                )}>
                                <IconLayoutDashboard className="mr-2 size-4" />
                                Dashboard
                              </Link>
                            </SheetClose>
                          ) : null}

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => void onLogout()}>
                            Logout
                          </Button>
                        </>
                      ) : (
                        <SheetClose asChild>
                          <Link
                            href="/auth/login"
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              "h-10 w-full",
                            )}>
                            Log In
                          </Link>
                        </SheetClose>
                      )}
                    </div>
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
