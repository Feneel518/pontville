import "server-only";
import nodemailer from "nodemailer";

type Attachment =
  | {
      filename: string;
      content: string | Buffer;
      contentType?: string;
      encoding?: string;
    }
  | {
      filename: string;
      path: string;
      contentType?: string;
    };

export type SendMailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;

  // Optional
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];

  attachments?: Attachment[];
};

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  // Option A: SMTP (recommended for custom domains / Zoho / Gmail SMTP etc.)
  const host = requiredEnv("SMTP_HOST");
  const port = Number(requiredEnv("SMTP_PORT"));
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587/25
    auth: { user, pass },
  });

  return cachedTransporter;
}

function normalizeList(v?: string | string[]) {
  if (!v) return undefined;
  return Array.isArray(v) ? v : [v];
}

export async function sendMail(input: SendMailInput) {
  const transporter = getTransporter();

  const from =
    input.from ??
    process.env.MAIL_FROM ??
    `"No Reply" <${requiredEnv("SMTP_USER")}>`;

  const info = await transporter.sendMail({
    from,
    to: normalizeList(input.to),
    cc: normalizeList(input.cc),
    bcc: normalizeList(input.bcc),
    replyTo: input.replyTo,

    subject: input.subject,
    html: input.html,
    text: input.text,

    attachments: input.attachments,
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
}
