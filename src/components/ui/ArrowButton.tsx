"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import useCursorStore from "@/hooks/useCursorStore";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { FC, useRef } from "react";

interface ArrowButtonProps {
  label: string;
  direction: "left" | "right";
  className?: string;
  showLabel?: boolean;
  href?: string;
  newTab?: boolean;
}

const ArrowButton: FC<ArrowButtonProps> = ({
  direction = "right",
  label,
  className,
  href,
  showLabel = true,
  newTab = false,
}) => {
  const mainTextRef = useRef(null);
  const setCursor = useCursorStore((s) => s.setCursor);
  const { label: cursorLabel, type } = useCursorStore();

  const isMobile = useIsMobile();

  const onPointerEnter = () => {
    setCursor({
      label,
      type: "label",
    });
  };

  if (label === "Add to cart") {
    setCursor({ label: null, type: "default" });
  }
  const onPointerLeave = () => setCursor({ label: null, type: "default" });
  return (
    <Link
      href={href ?? "#"}
      ref={mainTextRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className={cn(
        `group flex cursor-pointer items-center z-40 gap-2 md:p-2 md:pl-0 max-md:-ml-2`,
        className,
      )}>
      {direction === "left" && (
        <div
          className={`h-4 flex items-center justify-center  translate-x-0 transition-transform duration-300 ${direction === "left" ? "group-hover:-translate-x-2" : "group-hover:translate-x-2"}`}>
          {showLabel && label}
        </div>
      )}
      <div
        className={`relative h-4 ${isMobile ? "w-[130px]" : "w-[200px]"}   shrink-0 inline-block translate-x-0 transition-transform duration-300 ${direction === "left" ? "group-hover:-translate-x-2" : "group-hover:translate-x-2"}`}>
        {isMobile ? (
          <Image
            src="/gallery/SmallArrow.svg"
            alt="Arrow"
            fill
            className={`object-contain ${direction === "left" ? "-rotate-180" : "rotate-0"}`}
          />
        ) : (
          <Image
            src="/Arrow.svg"
            alt="Arrow"
            fill
            className={`object-contain ${direction === "left" ? "-rotate-180" : "rotate-0"}`}
          />
        )}
      </div>

      {direction === "right" && (
        <div
          className={`h-4 flex items-center justify-center  translate-x-0 transition-transform duration-300 ${direction === "right" ? "group-hover:translate-x-2" : "group-hover:translate-x-2"}`}>
          {showLabel && label}
        </div>
      )}
    </Link>
  );
};

export default ArrowButton;
