import PromotionsTable from "@/components/dashboard/promotions/PromotionsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listPromoBannersAction } from "@/lib/actions/dashboard/promotions/listPromotionsAction";

import { requireUser } from "@/lib/checks/requireUser";

export default async function PromotionsPage() {
  await requireUser("promotions");
  const banners = await listPromoBannersAction();

  console.log(banners);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Promotions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create promo banners for Home, Menu, and Events. Schedule them,
            style them, and toggle active.
          </p>
        </CardHeader>
        <CardContent>
          <PromotionsTable initialBanners={banners} />
        </CardContent>
      </Card>
    </div>
  );
}
