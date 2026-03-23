"use server";

import { requireAuth } from "@/lib/checks/requireAuth";

import z from "zod";
import { performInquiryDecision } from "./performInquiryDecision";

const updateSchema = z.object({
  inquiryId: z.string().min(1),
  status: z.enum(["ACCEPTED", "REJECTED"]),
  staffNote: z.string().max(1000).optional(),
});

export async function decideInquiryAction(input: z.infer<typeof updateSchema>) {
  const { inquiryId, status, staffNote } = updateSchema.parse(input);
  const session = await requireAuth();

  await performInquiryDecision({
    inquiryId,
    status,
    staffNote: staffNote ?? null,
    handledById: session.user.id,
  });

  return { ok: true };
}
