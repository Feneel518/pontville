import Link from "next/link";
import { CheckCircle2, CircleAlert, MailCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SearchParams = Promise<{
  status?: string;
  decision?: string;
  inquiryId?: string;
}>;

function getContent(status?: string, decision?: string) {
  switch (status) {
    case "success":
      if (decision === "ACCEPTED") {
        return {
          icon: CheckCircle2,
          title: "Inquiry accepted",
          description:
            "This inquiry was successfully accepted from the email action link.",
        };
      }

      if (decision === "REJECTED") {
        return {
          icon: XCircle,
          title: "Inquiry rejected",
          description:
            "This inquiry was successfully rejected from the email action link.",
        };
      }

      return {
        icon: MailCheck,
        title: "Action completed",
        description: "The inquiry action was completed successfully.",
      };

    case "already-decided":
      return {
        icon: CircleAlert,
        title: "Inquiry already decided",
        description:
          "This inquiry was already accepted or rejected earlier, so no further action was taken.",
      };

    case "unauthorized":
      return {
        icon: CircleAlert,
        title: "Invalid or expired link",
        description:
          "This action link is invalid, expired, or no longer available.",
      };

    case "not-found":
      return {
        icon: CircleAlert,
        title: "Inquiry not found",
        description: "We could not find the inquiry for this action link.",
      };

    case "invalid":
    default:
      return {
        icon: CircleAlert,
        title: "Invalid request",
        description: "The action link is incomplete or invalid.",
      };
  }
}

export default async function InquiryActionResultPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  const status = searchParams.status;
  const decision = searchParams.decision;
  const inquiryId = searchParams.inquiryId;

  const content = getContent(status, decision);
  const Icon = content.icon;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10">
        <Card className="w-full rounded-2xl shadow-sm">
          <CardHeader className="pb-2 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-background">
                <Icon className="h-8 w-8" />
              </div>
            </div>

            <CardTitle className="text-2xl">{content.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <p className="text-sm text-muted-foreground">
              {content.description}
            </p>

            {inquiryId ? (
              <div className="rounded-xl border bg-background p-4 text-left">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Inquiry ID
                </div>
                <div className="mt-1 break-all font-mono text-sm">
                  {inquiryId}
                </div>

                {decision ? (
                  <>
                    <div className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Decision
                    </div>
                    <div className="mt-1 text-sm font-semibold">{decision}</div>
                  </>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="/dashboard/inquiries">Back to inquiries</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
