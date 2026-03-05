"use client";

import * as React from "react";
import { Review } from "@prisma/client";
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
import { Pencil, Trash2 } from "lucide-react";
import { ResponsiveModal } from "@/components/global/ResponsiveModal";
import ReviewForm from "./ReviewForm";
import { toggleFeaturedAction } from "@/lib/actions/dashboard/review/toggleFeatured";

function stars(n: number) {
  return "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
}

export default function ReviewsTable({
  initialReviews,
}: {
  initialReviews: Review[];
}) {
  const [reviews, setReviews] = React.useState<Review[]>(initialReviews);

  const [openCreate, setOpenCreate] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editReview, setEditReview] = React.useState<Review | null>(null);

  const [isPending, startTransition] = React.useTransition();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-medium text-foreground">{reviews.length}</span>
        </div>

        <ResponsiveModal
          open={openCreate}
          onOpenChange={setOpenCreate}
          trigger={<Button>Add Review</Button>}>
          <ReviewForm
            mode="create"
            open={openCreate}
            onOpenChange={setOpenCreate}
            onCreated={(created) => {
              setReviews((prev) => [created, ...prev]);
              setOpenCreate(false);
            }}
          />
        </ResponsiveModal>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reviewer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground">
                  No reviews yet. Add your first review.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="max-w-[520px]">
                    <div className="font-medium">{r.authorName}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {r.message}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm font-medium">{r.rating}/5</div>
                    <div className="text-xs text-muted-foreground">
                      {stars(r.rating)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="rounded-full">
                      {r.source}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {r.isFeatured ? (
                      <Badge className="rounded-full">Featured</Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full">
                        Hidden
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      {/* Toggle featured */}
                      <Button
                        size="sm"
                        variant={r.isFeatured ? "secondary" : "default"}
                        className="rounded-xl"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            const next = !r.isFeatured;
                            const res = await toggleFeaturedAction(r.id, next);
                            if (!res.ok) {
                              toast.error(
                                typeof res.error === "string"
                                  ? res.error
                                  : "Failed",
                              );
                              return;
                            }

                            setReviews((prev) =>
                              prev.map((x) =>
                                x.id === r.id ? { ...x, isFeatured: next } : x,
                              ),
                            );

                            toast.success(
                              next ? "Review featured" : "Review hidden",
                            );
                          });
                        }}>
                        {r.isFeatured ? "Hide" : "Feature"}
                      </Button>

                      {/* Delete */}
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
