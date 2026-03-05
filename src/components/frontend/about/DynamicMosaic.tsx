import { cn } from "@/lib/utils";
import Image from "next/image";
import { FC } from "react";

export type MasonryImage = {
  src: string;
  alt: string;
  /** Provide width/height if you can (best for Next/Image) */
  width?: number;
  height?: number;
  /** Optional caption */
  caption?: string;
};
interface DynamicMosaicProps {
  images: MasonryImage[];
  className?: string;

  /**
   * Control responsive columns with Tailwind classes.
   * Example: "columns-1 sm:columns-2 lg:columns-3"
   */
  columnsClassName?: string;

  /** gap between items */
  gapClassName?: string;
}

const DynamicMosaic: FC<DynamicMosaicProps> = ({
  images,
  className,
  columnsClassName = "columns-1 sm:columns-2 lg:columns-3 xl:columns-4" ,
  gapClassName = "gap-4",
}) => {
  const MAX_COLUMNS = 3;
  const getColumns = (colIndex: number) => {
    return images.filter((image, index) => {
      return index % MAX_COLUMNS === colIndex;
    });
  };
  return (
    <div className={cn(columnsClassName, gapClassName, className)}>
      {images.map((img, idx) => (
        <figure
          key={`${img.src}-${idx}`}
          className={cn(
            "mb-4 break-inside-avoid",
            "inline-block w-full",
            "overflow-hidden rounded-2xl ring-1 ring-black/10",
            "bg-muted/20",
          )}>
          {/* If you have width/height -> best quality + no layout shift */}
          {img.width && img.height ? (
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              className="h-auto w-full object-cover"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            // Fallback if you DON'T have width/height
            // Works, but you might see a tiny layout shift.
            <Image
              src={img.src}
              alt={img.alt}
              width={1200}
              height={800}
              className="h-auto w-full object-cover"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          )}

          {img.caption ? (
            <figcaption className="p-3 text-sm text-muted-foreground">
              {img.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
};

export default DynamicMosaic;
