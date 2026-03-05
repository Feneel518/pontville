import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import ArrowButton from "@/components/ui/ArrowButton";

import {
  getActivePromoBannersAction,
  PromoPlacement,
} from "@/lib/actions/dashboard/promotions/getActivePromoBanners";

type PromoGridProps = {
  placement: PromoPlacement;
  className?: string;
  limit?: number; // number of promos (not tiles)
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

function TileImage({ src, alt }: { src?: string | null; alt: string }) {
  // If no image, show a classy fallback
  if (!src) {
    return (
      <div className="w-full h-full bg-muted/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--foreground)/0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,hsl(var(--foreground)/0.06),transparent)]" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover transition duration-500 group-hover:scale-[1.03]"
      sizes="(max-width: 768px) 100vw, 25vw"
      priority={false}
    />
  );
}

function PromoTextTile({
  title,
  message,
  href,
}: {
  title: string;
  message: string;
  href?: string | null;
}) {
  const content = (
    <div className="p-5 md:p-6 lg:p-8 flex h-full w-full items-center justify-center text-center">
      <div className="max-w-[28ch]">
        <h3 className="font-serif uppercase text-[clamp(20px,3.2vw,40px)] leading-tight">
          {title}
        </h3>
        <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
          {message}
        </p>
      </div>
    </div>
  );

  // If banner has link, make the whole tile clickable
  if (href) {
    return (
      <Link
        href={href}
        className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {content}
      </Link>
    );
  }

  return content;
}

export default async function PromoGrid({
  placement,
  className,
  limit = 4,
  heading = "Promotions",
  ctaLabel = "Enquire",
  ctaHref = "/book", // change if you want
}: PromoGridProps) {
  const banners = await getActivePromoBannersAction(placement);
  if (!banners.length) return null;

  const items = banners.slice(0, limit);

  return (
    <>
      <SectionComponent>
        <Heading label={heading} />
      </SectionComponent>

      {/* Editorial alternating grid */}
      <div
        className={cn(
          "grid grid-cols-2 md:grid-cols-4 -mt-6 gap-6 max-md:mt-6 max-md:p-4",
          className,
        )}>
        {items.flatMap((b, idx) => {
          // Alternate order every other promo so it feels dynamic
          // Even index: [Image, Text]
          // Odd index:  [Text, Image]
          const imageTile = (
            <div
              key={`${b.id}-img`}
              className="group w-full aspect-5/4 relative overflow-hidden"
              style={
                b.backgroundColor
                  ? { background: b.backgroundColor }
                  : undefined
              }>
              <TileImage src={b.imageUrl} alt={b.title} />
              {/* soft overlay for readability */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
            </div>
          );

          const textTile = (
            <div
              key={`${b.id}-text`}
              className="w-full aspect-5/4 relative flex items-center justify-center border bg-background"
              style={
                b.textColor || b.backgroundColor
                  ? {
                      color: b.textColor || undefined,
                      background: b.backgroundColor || undefined,
                    }
                  : undefined
              }>
              <PromoTextTile
                title={b.title}
                message={b.message}
                
              />
            </div>
          );

          return idx % 2 === 0 ? [imageTile, textTile] : [textTile, imageTile];
        })}
      </div>

      {/* CTA row */}
      <div className="w-full flex items-center md:justify-end px-6 pt-10 md:px-12 lg:px-20">
        <ArrowButton
          direction="right"
          href="/events"
          label={"All Events"}></ArrowButton>
      </div>
    </>
  );
}
