"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function OrdersPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const go = (nextPage: number) => {
    const params = new URLSearchParams(sp?.toString() ?? "");
    params.set("page", String(nextPage));
    router.push(`/orders?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => go(page - 1)}>
        Prev
      </Button>

      <div className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </div>

      <Button
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => go(page + 1)}>
        Next
      </Button>
    </div>
  );
}
