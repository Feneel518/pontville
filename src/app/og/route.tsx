import { SITE } from "@/lib/helpers/seo";
import { ImageResponse } from "next/og";


export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? SITE.name;
  const subtitle =
    searchParams.get("subtitle") ??
    "Serving travellers since 1835 • Pontville, Tasmania";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 72,
        background: "white",
      }}>
      <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05 }}>
        {title}
      </div>
      <div style={{ fontSize: 28, marginTop: 18, opacity: 0.8 }}>
        {subtitle}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
