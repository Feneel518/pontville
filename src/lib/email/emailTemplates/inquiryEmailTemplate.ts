import { formatUsd } from "@/lib/helpers/formatCurrency";
import { EventInquiry, Inquiry, TableInquiry } from "@prisma/client";

type FullInquiry = Inquiry & {
  tableInquiry?: TableInquiry | null;
  eventInquiry?: EventInquiry | null;
};

export type BrandConfig = {
  restaurantName: string;
  logoUrl?: string; // optional
  primaryColor?: string; // hex
  supportEmail?: string; // optional
  supportPhone?: string; // optional
  websiteUrl?: string; // optional
  addressLine?: string; // optional
};

function esc(s: unknown) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fmtDateTime(d?: Date | null) {
  if (!d) return "-";
  // Keep it simple & predictable. If you want locale formatting, pass a formatted string instead.
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function fmtDate(d?: Date | null) {
  if (!d) return "-";
  return d.toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function baseLayout(opts: {
  brand: BrandConfig;
  title: string;
  subtitle?: string;
  badgeText: string;
  badgeColor: string;
  bodyHtml: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  footerNote?: string;
}) {
  const brand = opts.brand;
  const primary = brand.primaryColor ?? "#0ea5e9"; // sky-500 fallback
  const logo = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" alt="${esc(brand.restaurantName)}" style="height:40px; display:block;" />`
    : `<div style="font-weight:800; letter-spacing:0.5px; font-size:18px; color:#0f172a;">${esc(
        brand.restaurantName,
      )}</div>`;

  const website = brand.websiteUrl
    ? `<a href="${esc(brand.websiteUrl)}" style="color:${primary}; text-decoration:none;">${esc(
        brand.websiteUrl.replace(/^https?:\/\//, ""),
      )}</a>`
    : "";

  const supportLine =
    brand.supportEmail || brand.supportPhone
      ? `<div style="margin-top:8px; color:#64748b; font-size:12px;">
          ${
            brand.supportEmail
              ? `Email: <a href="mailto:${esc(
                  brand.supportEmail,
                )}" style="color:${primary}; text-decoration:none;">${esc(
                  brand.supportEmail,
                )}</a>`
              : ""
          }
          ${
            brand.supportEmail && brand.supportPhone
              ? `&nbsp;&nbsp;•&nbsp;&nbsp;`
              : ""
          }
          ${
            brand.supportPhone
              ? `Phone: <a href="tel:${esc(
                  brand.supportPhone,
                )}" style="color:${primary}; text-decoration:none;">${esc(
                  brand.supportPhone,
                )}</a>`
              : ""
          }
        </div>`
      : "";

  const addressLine = brand.addressLine
    ? `<div style="margin-top:6px; color:#94a3b8; font-size:12px;">${esc(
        brand.addressLine,
      )}</div>`
    : "";

  const ctas =
    opts.ctaPrimary || opts.ctaSecondary
      ? `<div style="margin-top:22px;">
          ${
            opts.ctaPrimary
              ? `<a href="${esc(opts.ctaPrimary.href)}"
                   style="background:${primary}; color:#ffffff; text-decoration:none; padding:12px 16px; border-radius:12px; font-weight:700; display:inline-block;">
                   ${esc(opts.ctaPrimary.label)}
                 </a>`
              : ""
          }
          ${
            opts.ctaSecondary
              ? ` <a href="${esc(opts.ctaSecondary.href)}"
                   style="margin-left:10px; background:#ffffff; border:1px solid #e2e8f0; color:#0f172a; text-decoration:none; padding:12px 16px; border-radius:12px; font-weight:700; display:inline-block;">
                   ${esc(opts.ctaSecondary.label)}
                 </a>`
              : ""
          }
        </div>`
      : "";

  return `
  <div style="background:#0b1220; padding:32px 12px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 14px 40px rgba(0,0,0,0.25);">
      <div style="padding:22px 22px 0 22px;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:14px;">
          ${logo}
          <div style="font-size:12px; padding:6px 10px; border-radius:999px; background:${esc(
            opts.badgeColor,
          )}; color:#ffffff; font-weight:800;">
            ${esc(opts.badgeText)}
          </div>
        </div>

        <div style="margin-top:18px;">
          <div style="font-size:22px; font-weight:900; color:#0f172a;">${esc(opts.title)}</div>
          ${
            opts.subtitle
              ? `<div style="margin-top:6px; font-size:14px; color:#475569;">${esc(
                  opts.subtitle,
                )}</div>`
              : ""
          }
        </div>
      </div>

      <div style="padding:18px 22px 8px 22px;">
        ${opts.bodyHtml}
        ${ctas}
      </div>

      <div style="padding:18px 22px; background:#f8fafc; border-top:1px solid #e2e8f0;">
        ${
          opts.footerNote
            ? `<div style="color:#334155; font-size:12px; margin-bottom:10px;">${esc(
                opts.footerNote,
              )}</div>`
            : ""
        }
        <div style="color:#64748b; font-size:12px;">
          ${website}
          ${supportLine}
          ${addressLine}
          <div style="margin-top:10px; color:#94a3b8;">
            © ${new Date().getFullYear()} ${esc(brand.restaurantName)}. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function inquiryDetailsBlock(inquiry: FullInquiry) {
  const isTable = inquiry.type === "TABLE";
  const contact = `
    <div style="margin-top:14px; padding:14px; border:1px solid #e2e8f0; border-radius:14px;">
      <div style="font-weight:800; color:#0f172a; margin-bottom:8px;">Contact</div>
      <div style="color:#334155; font-size:14px;"><b>Name:</b> ${esc(inquiry.name)}</div>
      <div style="color:#334155; font-size:14px;"><b>Email:</b> ${esc(inquiry.email || "-")}</div>
      <div style="color:#334155; font-size:14px;"><b>Phone:</b> ${esc(inquiry.phone || "-")}</div>
    </div>`;

  const request = isTable
    ? `
    <div style="margin-top:12px; padding:14px; border:1px solid #e2e8f0; border-radius:14px;">
      <div style="font-weight:800; color:#0f172a; margin-bottom:8px;">Table Request</div>
      <div style="color:#334155; font-size:14px;"><b>Date & Time:</b> ${esc(
        fmtDateTime(inquiry.tableInquiry?.bookingAt ?? null),
      )}</div>
      <div style="color:#334155; font-size:14px;"><b>Guests:</b> ${esc(
        inquiry.tableInquiry?.guests ?? "-",
      )}</div>
    </div>`
    : `
    <div style="margin-top:12px; padding:14px; border:1px solid #e2e8f0; border-radius:14px;">
      <div style="font-weight:800; color:#0f172a; margin-bottom:8px;">Event Request</div>
      <div style="color:#334155; font-size:14px;"><b>Event Type:</b> ${esc(
        inquiry.eventInquiry?.eventType ?? "-",
      )}</div>
      <div style="color:#334155; font-size:14px;"><b>Event Date:</b> ${esc(
        fmtDate(inquiry.eventInquiry?.eventDate ?? null),
      )}</div>
      <div style="color:#334155; font-size:14px;"><b>Expected Guests:</b> ${esc(
        inquiry.eventInquiry?.expectedGuests ?? "-",
      )}</div>
      <div style="color:#334155; font-size:14px;"><b>Budget:</b> ${esc(
        formatUsd(inquiry.eventInquiry?.budget ?? null),
      )}</div>
    </div>`;

  const notes = inquiry.notes
    ? `<div style="margin-top:12px; padding:14px; border:1px dashed #cbd5e1; border-radius:14px; background:#fbfdff;">
         <div style="font-weight:800; color:#0f172a; margin-bottom:8px;">Customer Notes</div>
         <div style="color:#334155; font-size:14px;">${esc(inquiry.notes)}</div>
       </div>`
    : "";

  const staff = inquiry.staffNote
    ? `<div style="margin-top:12px; padding:14px; border:1px dashed #cbd5e1; border-radius:14px; background:#fbfdff;">
         <div style="font-weight:800; color:#0f172a; margin-bottom:8px;">Message from ${esc(
           "our team",
         )}</div>
         <div style="color:#334155; font-size:14px;">${esc(inquiry.staffNote)}</div>
       </div>`
    : "";

  return `${contact}${request}${notes}${staff}`;
}

export function acceptedInquiryEmail(
  inquiry: FullInquiry,
  brand: BrandConfig,
  opts?: {
    whatsappLink?: string; // optional
    manageLink?: string; // optional website link
  },
) {
  const isTable = inquiry.type === "TABLE";

  const body = `
    <div style="font-size:14px; color:#334155;">
      Hi ${esc(inquiry.name)},<br/><br/>
      Your <b>${isTable ? "table booking" : "event inquiry"}</b> has been <b>ACCEPTED</b>.
      We’re excited to host you.
    </div>

    ${inquiryDetailsBlock(inquiry)}

    <div style="margin-top:14px; font-size:13px; color:#475569;">
      If you need to make changes, reply to this email and we’ll help you.
    </div>
  `;

  return {
    subject: `${brand.restaurantName} • Confirmed ✅`,
    html: baseLayout({
      brand,
      title: isTable ? "Booking Confirmed" : "Inquiry Confirmed",
      subtitle: "Your request has been accepted by our team.",
      badgeText: "CONFIRMED",
      badgeColor: "#16a34a",
      bodyHtml: body,
      ctaPrimary: opts?.manageLink
        ? { label: "View Details", href: opts.manageLink }
        : undefined,
      ctaSecondary: opts?.whatsappLink
        ? { label: "WhatsApp Us", href: opts.whatsappLink }
        : undefined,
      footerNote:
        "Tip: Please arrive 10 minutes early for the best experience.",
    }),
  };
}

export function rejectedInquiryEmail(
  inquiry: FullInquiry,
  brand: BrandConfig,
  opts?: {
    whatsappLink?: string; // optional
    manageLink?: string; // optional website link
  },
) {
  const isTable = inquiry.type === "TABLE";

  const body = `
    <div style="font-size:14px; color:#334155;">
      Hi ${esc(inquiry.name)},<br/><br/>
      Thank you for contacting <b>${esc(brand.restaurantName)}</b>.
      Unfortunately, we’re unable to accommodate your <b>${isTable ? "table booking" : "event inquiry"}</b> at this time.
    </div>

    ${inquiryDetailsBlock(inquiry)}

    <div style="margin-top:14px; font-size:13px; color:#475569;">
      If you can share an alternative date/time (or requirements), we’ll try our best to help.
    </div>
  `;

  return {
    subject: `${brand.restaurantName} • Update on your request`,
    html: baseLayout({
      brand,
      title: "We couldn’t accommodate this request",
      subtitle: "But we’d love to help with an alternate plan.",
      badgeText: "NOT AVAILABLE",
      badgeColor: "#dc2626",
      bodyHtml: body,
      ctaPrimary: opts?.whatsappLink
        ? { label: "Try on WhatsApp", href: opts.whatsappLink }
        : undefined,
      ctaSecondary: opts?.manageLink
        ? { label: "View Details", href: opts.manageLink }
        : undefined,
      footerNote: "We appreciate your understanding.",
    }),
  };
}

export function receivedInquiryEmail(
  inquiry: FullInquiry,
  brand: BrandConfig,
  opts?: {
    whatsappLink?: string;
    manageLink?: string;
    etaText?: string; // e.g. "within 2 hours" / "today"
  },
) {
  const isTable = inquiry.type === "TABLE";

  const body = `
    <div style="font-size:14px; color:#334155;">
      Hi ${esc(inquiry.name)},<br/><br/>
      Thanks for reaching out to <b>${esc(brand.restaurantName)}</b> — we’ve received your
      <b>${isTable ? " table booking request" : " event inquiry"}</b>.
      <br/><br/>
      Our team will review it and get back to you ${
        opts?.etaText ? `<b>${esc(opts.etaText)}</b>` : "soon"
      }.
    </div>

    ${inquiryDetailsBlock(inquiry)}

    <div style="margin-top:14px; font-size:13px; color:#475569;">
      <b>Note:</b> This is not a confirmation yet — you’ll receive another email once it’s accepted or rejected.
    </div>

    <div style="margin-top:10px; font-size:13px; color:#475569;">
      If you need urgent help or want to update details, you can reply to this email.
    </div>
  `;

  return {
    subject: `${brand.restaurantName} • Inquiry received`,
    html: baseLayout({
      brand,
      title: "We’ve received your request",
      subtitle: "Our team is reviewing it now.",
      badgeText: "RECEIVED",
      badgeColor: "#f59e0b", // amber
      bodyHtml: body,
      ctaPrimary: opts?.manageLink
        ? { label: "View Request", href: opts.manageLink }
        : undefined,
      ctaSecondary: opts?.whatsappLink
        ? { label: "WhatsApp Us", href: opts.whatsappLink }
        : undefined,
      footerNote:
        "Tip: If your date/time is flexible, mention alternate options to speed up confirmation.",
    }),
  };
}

export function adminInquiryReceivedEmail(
  inquiry: FullInquiry,
  brand: BrandConfig,
  opts?: {
    dashboardLink?: string;
  },
) {
  const isTable = inquiry.type === "TABLE";

  const isToday =
    isTable &&
    inquiry.tableInquiry?.bookingAt &&
    new Date(inquiry.tableInquiry.bookingAt).toDateString() ===
      new Date().toDateString();

  const urgencyBadge = isToday
    ? `<div style="margin-bottom:10px; padding:8px 12px; background:#dc2626; color:#fff; font-weight:800; border-radius:8px; display:inline-block;">
         SAME DAY BOOKING
       </div>`
    : `<div style="margin-bottom:10px; padding:8px 12px; background:#0ea5e9; color:#fff; font-weight:800; border-radius:8px; display:inline-block;">
         NEW INQUIRY
       </div>`;

  const body = `
    <div style="font-size:14px; color:#334155;">
      ${urgencyBadge}

      A new <b>${isTable ? "table booking" : "event"}</b> inquiry has been submitted.

      ${inquiryDetailsBlock(inquiry)}

      <div style="margin-top:16px; font-size:14px; font-weight:700; color:#0f172a;">
        Action Required:
      </div>

      <div style="margin-top:6px; font-size:13px; color:#475569;">
        Please review and accept or reject this request in the dashboard.
      </div>
    </div>
  `;

  return {
    subject: `New ${isTable ? "Table" : "Event"} Inquiry • ${inquiry.name}`,
    html: baseLayout({
      brand,
      title: "New Inquiry Received",
      subtitle: "Review and take action from your dashboard.",
      badgeText: "ADMIN ALERT",
      badgeColor: "#0f172a",
      bodyHtml: body,
      ctaPrimary: opts?.dashboardLink
        ? { label: "Open Dashboard", href: opts.dashboardLink }
        : undefined,
      footerNote: "This is an automated notification from your booking system.",
    }),
  };
}

export function cancelledBookingEmail(
  inquiry: FullInquiry,
  brand: BrandConfig,
  opts?: {
    whatsappLink?: string;
    manageLink?: string;
  },
) {
  const isTable = inquiry.type === "TABLE";

  const body = `
    <div style="font-size:14px; color:#334155;">
      Hi ${esc(inquiry.name)},<br/><br/>
      Your <b>${isTable ? "table booking" : "request"}</b> at
      <b>${esc(brand.restaurantName)}</b> has been <b>CANCELLED</b>.
    </div>

    ${inquiryDetailsBlock(inquiry)}

    <div style="margin-top:14px; font-size:13px; color:#475569;">
      If you’d like to rebook for another time, reply to this email and we’ll help you find the best available slot.
    </div>
  `;

  return {
    subject: `${brand.restaurantName} • Booking cancelled`,
    html: baseLayout({
      brand,
      title: "Booking Cancelled",
      subtitle: "We can help you rebook quickly.",
      badgeText: "CANCELLED",
      badgeColor: "#dc2626",
      bodyHtml: body,
      ctaPrimary: opts?.whatsappLink
        ? { label: "Rebook on WhatsApp", href: opts.whatsappLink }
        : undefined,
      ctaSecondary: opts?.manageLink
        ? { label: "View Details", href: opts.manageLink }
        : undefined,
      footerNote:
        "Tip: Share 2–3 alternate times and we’ll confirm the best option.",
    }),
  };
}

export function adminContactReceivedEmail(
  contact: {
    name: string;
    email: string;
    phone?: string | null;
    note?: string | null;
  },
  brand: BrandConfig,
  opts?: {
    dashboardLink?: string;
  },
) {
  const badge = `
    <div style="margin-bottom:10px; padding:8px 12px; background:#16a34a; color:#fff; font-weight:800; border-radius:8px; display:inline-block;">
      NEW CONTACT MESSAGE
    </div>
  `;

  const body = `
    <div style="font-size:14px; color:#334155;">
      ${badge}

      A new <b>contact message</b> has been submitted from the website.

      <div style="margin-top:16px; border:1px solid #e2e8f0; border-radius:10px; padding:14px;">
        
        <div style="margin-bottom:8px;">
          <span style="font-weight:700;">Name:</span>
          ${contact.name}
        </div>

        <div style="margin-bottom:8px;">
          <span style="font-weight:700;">Email:</span>
          <a href="mailto:${contact.email}" style="color:#0ea5e9;">
            ${contact.email}
          </a>
        </div>

        ${
          contact.phone
            ? `
        <div style="margin-bottom:8px;">
          <span style="font-weight:700;">Phone:</span>
          <a href="tel:${contact.phone}" style="color:#0ea5e9;">
            ${contact.phone}
          </a>
        </div>`
            : ""
        }

        ${
          contact.note
            ? `
        <div style="margin-top:12px;">
          <div style="font-weight:700; margin-bottom:4px;">Message:</div>
          <div style="background:#f8fafc; padding:10px; border-radius:6px;">
            ${contact.note}
          </div>
        </div>`
            : ""
        }

      </div>

      <div style="margin-top:16px; font-size:14px; font-weight:700; color:#0f172a;">
        Action Suggested:
      </div>

      <div style="margin-top:6px; font-size:13px; color:#475569;">
        You may reply directly to this email to respond to the customer.
      </div>
    </div>
  `;

  return {
    subject: `New Contact Message • ${contact.name}`,
    html: baseLayout({
      brand,
      title: "New Contact Message",
      subtitle: "A visitor submitted the contact form.",
      badgeText: "CONTACT",
      badgeColor: "#16a34a",
      bodyHtml: body,
      ctaPrimary: opts?.dashboardLink
        ? {
            label: "Open Dashboard",
            href: opts.dashboardLink,
          }
        : undefined,
      footerNote: "This message was sent from your website contact form.",
    }),
  };
}