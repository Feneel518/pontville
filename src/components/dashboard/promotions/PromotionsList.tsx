"use client";

import * as React from "react";
import { PromoBanner } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { togglePromoBannerAction } from "@/lib/actions/dashboard/promotions/togglePromoBanner";
import PromoBannerUpsertDialog from "./PromoBannerUpsertDialog";
import { ResponsiveModal } from "@/components/global/ResponsiveModal";
import PromotionForm from "./PromotionForm";

function fmt(d?: Date | null) {
  if (!d) return "—";
  // show compact local
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));
  } catch {
    return String(d);
  }
}

function placements(b: PromoBanner) {
  const p: string[] = [];
  if (b.showOnHome) p.push("Home");
  if (b.showOnMenu) p.push("Menu");
  if (b.showOnEvents) p.push("Events");
  return p.length ? p.join(" • ") : "—";
}

export default function PromotionsTable({
  initialBanners,
}: {
  initialBanners: PromoBanner[];
}) {
  const [banners, setBanners] = React.useState<PromoBanner[]>(initialBanners);
  const [openCreate, setOpenCreate] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editBanner, setEditBanner] = React.useState<PromoBanner | null>(null);
  const [isPending, startTransition] = React.useTransition();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-medium text-foreground">{banners.length}</span>
        </div>

        <ResponsiveModal
          onOpenChange={setOpenCreate}
          open={openCreate}
          trigger={<Button>Create New</Button>}>
          <PromotionForm
            mode="create"
            onOpenChange={setOpenCreate}
            open={openCreate}></PromotionForm>
        </ResponsiveModal>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Placements</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground">
                  No promotions yet. Create your first banner.
                </TableCell>
              </TableRow>
            ) : (
              banners.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {b.message}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="rounded-full">
                      {b.bannerType}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm">{placements(b)}</TableCell>

                  <TableCell className="text-sm">
                    <div className="text-xs text-muted-foreground">
                      Start: {fmt(b.startAt)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      End: {fmt(b.endAt)}
                    </div>
                  </TableCell>

                  <TableCell>
                    {b.isActive ? (
                      <Badge className="rounded-full">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <ResponsiveModal
                        onOpenChange={setOpenEdit}
                        open={openEdit}
                        trigger={
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setEditBanner(b)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }>
                        <PromotionForm
                          open={!!editBanner}
                          onOpenChange={(v) => {
                            if (!v) setEditBanner(null);
                          }}
                          mode="edit"
                          banner={editBanner ?? undefined}
                          onUpdated={(updated) => {
                            setBanners((prev) =>
                              prev.map((x) =>
                                x.id === updated.id ? updated : x,
                              ),
                            );
                            setEditBanner(null);
                          }}></PromotionForm>
                      </ResponsiveModal>

                      <Button
                        size="sm"
                        variant={b.isActive ? "secondary" : "default"}
                        className="rounded-xl"
                        disabled={isPending}
                        onClick={() => {
                          // @ts-ignore
                          startTransition(async () => {
                            const next = !b.isActive;
                            const res = await togglePromoBannerAction(
                              b.id,
                              next,
                            );
                            if (!res.ok)
                              return toast.error(
                                typeof res.error === "string"
                                  ? res.error
                                  : "Failed",
                              );

                            setBanners((prev) =>
                              prev.map((x) =>
                                x.id === b.id ? { ...x, isActive: next } : x,
                              ),
                            );
                            toast.success(
                              next ? "Banner activated" : "Banner deactivated",
                            );
                          });
                        }}>
                        {b.isActive ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
