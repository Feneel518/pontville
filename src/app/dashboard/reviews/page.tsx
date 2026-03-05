import ReviewsManager from "@/components/dashboard/review/ReviewsManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listReviewsAction } from "@/lib/actions/dashboard/review/listReviews";
import { requireUser } from "@/lib/checks/requireUser";

export default async function ReviewsPage() {
  await requireUser("reviews");
  const reviews = await listReviewsAction();

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add Google reviews manually, feature the best ones, and control the
            display order.
          </p>
        </CardHeader>
        <CardContent>
          <ReviewsManager initialReviews={reviews} />
        </CardContent>
      </Card>
    </div>
  );
}
