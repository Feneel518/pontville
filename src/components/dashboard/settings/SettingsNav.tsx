"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const items = [
  { key: "venue", label: "Venue" },
  { key: "hours", label: "Trading Hours" },
  { key: "brand", label: "Brand & Social" },
  { key: "seo", label: "SEO" },
  { key: "integrations", label: "Integrations" },
  { key: "homepage", label: "Home Page" },
  { key: "instagram", label: "Instagram" },
] as const;

export function SettingsNav({ active }: { active: string }) {
  const sp = useSearchParams();
  const base = "/dashboard/settings";

  const hrefFor = (key: string) => {
    const params = new URLSearchParams(sp.toString());
    params.set("section", key);
    return `${base}?${params.toString()}`;
  };

  return (
    <div className="space-y-4">
      {/* Mobile */}
      <div className="md:hidden">
        <Select
          value={active}
          onValueChange={(v) => {
            window.location.href = hrefFor(v);
          }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {items.map((i) => (
              <SelectItem key={i.key} value={i.key}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop */}
      <nav className="hidden md:block rounded-2xl border bg-card p-2 space-y-2">
        {items.map((i) => (
          <Link
            key={i.key}
            href={hrefFor(i.key)}
            className={cn(
              "block rounded-xl px-3 py-2 text-sm transition",
              active === i.key
                ? "bg-muted font-medium"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}>
            {i.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
