import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/db";

type Row = {
  key: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  lastSeenAt: Date;
  ordersCount: number;
  inquiriesCount: number;
  totalSpent: number; // cents
};

// stable cursor: lastSeenAt + key
function encodeCursor(lastSeenAt: Date, key: string) {
  return Buffer.from(
    JSON.stringify({ t: lastSeenAt.toISOString(), k: key }),
  ).toString("base64url");
}
function decodeCursor(cursor: string) {
  const { t, k } = JSON.parse(
    Buffer.from(cursor, "base64url").toString("utf8"),
  ) as { t: string; k: string };
  return { lastSeenAt: new Date(t), key: k };
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // IMPORTANT: Replace with your actual restaurantId resolver (session, slug, etc.)
  const restaurantId = url.searchParams.get("restaurantId") || "";
  if (!restaurantId) {
    return NextResponse.json(
      { error: "restaurantId required" },
      { status: 400 },
    );
  }

  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") || 20), 50);

  const cursorStr = url.searchParams.get("cursor");
  const cursor = cursorStr ? decodeCursor(cursorStr) : null;

  /**
   * Customer key rule (same as earlier):
   * - Prefer phone if available else email
   * - Normalize phone by stripping spaces
   * Note: if you want hardcore phone normalization, do it at input time.
   */

  // Search filter (applied to unioned rows)
  const searchLike = q ? `%${q.toLowerCase()}%` : null;

  // Cursor filter:
  // order by lastSeenAt desc, key desc
  // where (lastSeenAt, key) < (cursor.lastSeenAt, cursor.key) for next page
  const cursorFilterSql = cursor
    ? `AND (t."lastSeenAt" < $4 OR (t."lastSeenAt" = $4 AND t."key" < $5))`
    : ``;

  // Param positions:
  // $1 restaurantId
  // $2 limit
  // $3 searchLike
  // $4 cursor.lastSeenAt
  // $5 cursor.key
  const params: any[] = [restaurantId, limit];

  if (searchLike) params.push(searchLike);
  if (cursor) params.push(cursor.lastSeenAt, cursor.key);

  const rows = await prisma.$queryRawUnsafe<Row[]>(
    `
WITH unified AS (
  -- ORDERS (only PAID adds to totalSpent)
  SELECT
    CASE
      WHEN o."customerPhone" IS NOT NULL AND btrim(o."customerPhone") <> ''
        THEN 'phone:' || regexp_replace(o."customerPhone", '\\s+', '', 'g')
      ELSE NULL
    END AS "phoneKey",
    NULL::text AS "emailKey",
    o."customerName" AS "name",
    regexp_replace(o."customerPhone", '\\s+', '', 'g') AS "phone",
    NULL::text AS "email",
    o."createdAt" AS "seenAt",
    1::int AS "ordersCount",
    0::int AS "inquiriesCount",
    CASE WHEN o."paymentStatus" = 'PAID' THEN o."total" ELSE 0 END AS "spent"
  FROM "orders" o
  WHERE o."restaurantId" = $1

  UNION ALL

  -- INQUIRIES (TABLE/EVENT inquiries; no spend)
  SELECT
    CASE
      WHEN i."phone" IS NOT NULL AND btrim(i."phone") <> ''
        THEN 'phone:' || regexp_replace(i."phone", '\\s+', '', 'g')
      ELSE NULL
    END AS "phoneKey",
    CASE
      WHEN i."email" IS NOT NULL AND btrim(i."email") <> ''
        THEN 'email:' || lower(btrim(i."email"))
      ELSE NULL
    END AS "emailKey",
    i."name" AS "name",
    regexp_replace(i."phone", '\\s+', '', 'g') AS "phone",
    lower(btrim(i."email")) AS "email",
    i."createdAt" AS "seenAt",
    0::int AS "ordersCount",
    1::int AS "inquiriesCount",
    0::int AS "spent"
  FROM "Inquiry" i
  WHERE i."restaurantId" = $1
),
bucket AS (
  SELECT
    COALESCE("phoneKey", "emailKey") AS "key",
    max("seenAt") AS "lastSeenAt",
    -- pick best name/phone/email (simple approach)
    max("name") AS "name",
    max("phone") AS "phone",
    max("email") AS "email",
    sum("ordersCount")::int AS "ordersCount",
    sum("inquiriesCount")::int AS "inquiriesCount",
    sum("spent")::int AS "totalSpent"
  FROM unified
  WHERE COALESCE("phoneKey", "emailKey") IS NOT NULL
  GROUP BY COALESCE("phoneKey", "emailKey")
),
t AS (
  SELECT * FROM bucket
  WHERE 1=1
  ${
    searchLike
      ? `AND (
          lower(coalesce("name", '')) LIKE $3 OR
          lower(coalesce("phone", '')) LIKE $3 OR
          lower(coalesce("email", '')) LIKE $3
        )`
      : ``
  }
)
SELECT
  t."key",
  t."name",
  t."phone",
  t."email",
  t."lastSeenAt",
  t."ordersCount",
  t."inquiriesCount",
  t."totalSpent"
FROM t
WHERE 1=1
${cursorFilterSql}
ORDER BY t."lastSeenAt" DESC, t."key" DESC
LIMIT $2;
    `,
    ...params,
  );

  const nextCursor =
    rows.length === limit
      ? encodeCursor(
          rows[rows.length - 1].lastSeenAt,
          rows[rows.length - 1].key,
        )
      : null;

  return NextResponse.json({ items: rows, nextCursor });
}
