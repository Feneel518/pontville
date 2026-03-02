"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { UploadDropzone } from "@/lib/uploadthing/uploadthing";

type Endpoint = "restaurantImage" | "menuImage" | "menuItemImage";

type UploadResItem = {
  url?: string;
  ufsUrl?: string;
};

type BaseProps = {
  endpoint: Endpoint;
  label?: string;
  hint?: string;
  className?: string;
};

type SingleProps = BaseProps & {
  multiple?: false;
  value?: string | null;
  onChange: (url: string | null) => void;
};

type MultiProps = BaseProps & {
  multiple: true;
  value?: string[]; // gallery
  onChange: (urls: string[]) => void;
};

export function FileUpload(props: SingleProps | MultiProps) {
  const [busy, setBusy] = useState(false);

  const isMulti = props.multiple === true;

  const values = useMemo(() => {
    if (isMulti) return (props.value ?? []) as string[];
    return props.value ? [props.value] : [];
  }, [isMulti, props.value]);

  const setValues = (next: string[] | null) => {
    if (isMulti) {
      (props as MultiProps).onChange(next ?? []);
    } else {
      (props as SingleProps).onChange(next?.[0] ?? null);
    }
  };

  const removeAt = (idx: number) => {
    const next = values.filter((_, i) => i !== idx);
    setValues(next);
  };

  return (
    <div className={cn("space-y-3", props.className)}>
      {(props.label || props.hint) && (
        <div className="space-y-1">
          {props.label ? (
            <p className="text-sm font-medium">{props.label}</p>
          ) : null}
          {props.hint ? (
            <p className="text-sm text-muted-foreground">{props.hint}</p>
          ) : null}
        </div>
      )}

      {values.length > 0 ? (
        <div className="space-y-3">
          <div
            className={cn(
              "grid gap-3",
              isMulti ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1",
            )}>
            {values.map((url, idx) => (
              <div
                key={url + idx}
                className="overflow-hidden rounded-2xl border bg-card">
                <div
                  className={cn(
                    "relative",
                    isMulti ? "aspect-square" : "h-40",
                  )}>
                  <Image
                    src={url}
                    alt={props.label ?? "Uploaded image"}
                    fill
                    className="object-contain"
                    // if you ever upload SVGs or remote images not in next config
                    // unoptimized
                  />
                </div>

                <div className="flex items-center justify-between gap-3 border-t p-3">
                  <p className="truncate text-xs text-muted-foreground">
                    {url}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeAt(idx)}
                    disabled={busy}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!isMulti ? null : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setValues([])}
              disabled={busy}
              className="w-full">
              Remove all
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-3">
          <UploadDropzone
            input={{}}
            endpoint={props.endpoint}
            onUploadBegin={() => setBusy(true)}
            onClientUploadComplete={(res) => {
              const urls = (res as UploadResItem[] | undefined)
                ?.map((x) => x.ufsUrl ?? x.url)
                .filter(Boolean) as string[] | undefined;

              if (!urls || urls.length === 0) {
                setBusy(false);
                return;
              }

              setValues(isMulti ? urls : [urls[0]]);
              setBusy(false);
            }}
            onUploadError={(err) => {
              console.error("UPLOADTHING ERROR:", err);
              setBusy(false);
            }}
            className="ut-allowed-content:hidden ut-label:text-sm ut-button:rounded-xl ut-button:h-10"
            appearance={{
              container: "border-0 bg-transparent p-0 cursor-pointer group",
              uploadIcon:
                "text-primary -mb-4 mt-2 group-hover:-translate-y-2 transition-all duration-300 ease-in-out",
              label:
                "text-sm font-medium text-foreground mb-4 font-sans group-hover:-translate-y-2 transition-all duration-300 ease-in-out",
              allowedContent: "text-xs text-muted-foreground",
              button: cn(
                "inline-flex items-center justify-center -mt-4 whitespace-nowrap rounded-xl text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:hidden",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "h-10 px-4 py-2",
                busy && "opacity-60 pointer-events-none",
              ),
            }}
            content={{
              label: busy ? "Uploading…" : "Upload an image",
              allowedContent: isMulti
                ? "PNG, JPG up to 4MB each"
                : "PNG, JPG up to 4MB",
              button: busy
                ? "Uploading…"
                : isMulti
                  ? "Upload images"
                  : "Upload image",
            }}
          />
        </div>
      )}
    </div>
  );
}
