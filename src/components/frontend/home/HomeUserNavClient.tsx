"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconLayoutDashboard,
  IconLogout,
  IconReceipt2,
  IconShoppingCart,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { authClient } from "@/lib/auth/authClient"; // your better-auth client
import { User } from "better-auth";

export default function HomeUserNavClient({
  user,
  canAccessDashboard,
}: {
  user: User;
  canAccessDashboard: boolean;
}) {
  const router = useRouter();

  const initials =
    user?.name
      ?.split(" ")
      .map((x) => x[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  async function onLogout() {
    // ✅ Better Auth sign out
    await authClient.signOut();
    router.refresh();
    router.replace("/");
  }

  return (
    <div className="flex items-center gap-2 h-10 ">
      {/* Quick buttons (optional) */}

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 px-2 gap-2">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.image ?? ""} alt={user.name} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium truncate max-w-[140px]">
              {user.name}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-64 rounded-xl">
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 rounded-lg">
                <AvatarImage src={user.image ?? ""} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid leading-tight">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/cart" className="flex items-center gap-2">
                <IconShoppingCart className="size-4" />
                Cart
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/orders" className="flex items-center gap-2">
                <IconReceipt2 className="size-4" />
                Orders
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/booking" className="flex items-center gap-2">
                <IconUserCircle className="size-4" />
                Bookings
              </Link>
            </DropdownMenuItem>

            {canAccessDashboard ? (
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <IconLayoutDashboard className="size-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={onLogout}
            className="text-destructive focus:text-destructive">
            <IconLogout className="size-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
