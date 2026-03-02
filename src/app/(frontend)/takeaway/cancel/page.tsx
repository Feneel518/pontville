import SectionComponent from "@/components/global/SectionComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CancelPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  return (
    <SectionComponent className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Payment not completed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You didn’t complete the payment. Your cart is still saved — you can
            try again.
          </p>

          <div className="flex gap-2">
            <Button asChild className="rounded-xl">
              <Link href="/checkout">Try again</Link>
            </Button>

            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/cart">Back to cart</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </SectionComponent>
  );
}
