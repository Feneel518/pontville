import crypto from "crypto";

type Action = "ACCEPTED" | "REJECTED";

function getSecret() {
  const secret = process.env.INQUIRY_ACTION_SECRET;
  if (!secret) {
    throw new Error("Missing INQUIRY_ACTION_SECRET");
  }
  return secret;
}

export function createInquiryActionToken(params: {
  inquiryId: string;
  action: Action;
  expiresAt: number;
}) {
  const payload = `${params.inquiryId}:${params.action}:${params.expiresAt}`;

  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  return sig;
}

export function verifyInquiryActionToken(params: {
  inquiryId: string;
  action: Action;
  expiresAt: number;
  token: string;
}) {
  if (Date.now() > params.expiresAt) return false;

  const expected = createInquiryActionToken({
    inquiryId: params.inquiryId,
    action: params.action,
    expiresAt: params.expiresAt,
  });

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(params.token),
  );
}
