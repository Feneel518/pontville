"use client";

import * as React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function MenuQrCard({
  slug,
  label = "Scan to open menu",
}: {
  slug?: string;
  label?: string;
}) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const url = slug ? `${base}/menu/${slug}` : "";

  const downloadPng = () => {
    const canvas = document.getElementById(
      "menu-qr",
    ) as HTMLCanvasElement | null;
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `menu-${slug || "qr"}.png`;
    a.click();
  };

  const copy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  if (!slug) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Menu QR Code</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Save the menu first to generate a QR code.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu QR Code</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-[220px_1fr] items-start">
        <div className="rounded-xl border p-3 w-fit">
          <QRCodeCanvas id="menu-qr" value={url} size={180} includeMargin />
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {label}
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">QR Destination</div>
            <Input readOnly value={url} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={copy}>
              Copy Link
            </Button>
            <Button type="button" variant="outline" onClick={downloadPng}>
              Download PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(url, "_blank")}>
              Open
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: Print this and place it on tables / bar counter.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
