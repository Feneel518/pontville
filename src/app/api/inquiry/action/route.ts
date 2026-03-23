import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma/db";
import { performInquiryDecision } from "@/lib/actions/frontend/performInquiryDecision";
import { verifyInquiryActionToken } from "@/lib/actions/frontend/inquiryActionToken";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const inquiryId = url.searchParams.get("i");
  const action = url.searchParams.get("a");
  const token = url.searchParams.get("t");
  const expires = url.searchParams.get("e");

  if (!inquiryId || !action || !token || !expires) {
    return NextResponse.redirect(
      new URL("/inquiries/action-result?status=invalid", req.url),
    );
  }

  const normalizedAction =
    action === "accept" ? "ACCEPTED" : action === "reject" ? "REJECTED" : null;

  if (!normalizedAction) {
    return NextResponse.redirect(
      new URL("/inquiries/action-result?status=invalid", req.url),
    );
  }

  const expiresAt = Number(expires);

  if (
    !Number.isFinite(expiresAt) ||
    !verifyInquiryActionToken({
      inquiryId,
      action: normalizedAction,
      expiresAt,
      token,
    })
  ) {
    return NextResponse.redirect(
      new URL("/inquiries/action-result?status=unauthorized", req.url),
    );
  }

  const existing = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: { id: true, status: true },
  });

  if (!existing) {
    return NextResponse.redirect(
      new URL("/inquiries/action-result?status=not-found", req.url),
    );
  }

  if (existing.status === "ACCEPTED" || existing.status === "REJECTED") {
    return NextResponse.redirect(
      new URL(
        `/inquiries/action-result?status=already-decided&inquiryId=${existing.id}`,
        req.url,
      ),
    );
  }

  await performInquiryDecision({
    inquiryId,
    status: normalizedAction,
    staffNote:
      normalizedAction === "REJECTED"
        ? "Rejected via email action link"
        : "Accepted via email action link",
    handledById: null,
  });

  return NextResponse.redirect(
    new URL(
      `/inquiries/action-result?status=success&decision=${normalizedAction}&inquiryId=${inquiryId}`,
      req.url,
    ),
  );
}
