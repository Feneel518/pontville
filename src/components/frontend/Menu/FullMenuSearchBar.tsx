"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FullMenuSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = React.useState(initial);

  React.useEffect(() => {
    setValue(initial);
  }, [initial]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(t);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search dishes, drinks, burgers, pizza..."
          className="h-11 rounded-2xl pl-10 pr-10"
        />
        {value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search">
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        className="rounded-2xl"
        onClick={() => setValue("")}>
        Reset
      </Button>
    </div>
  );
}
