"use client";


import useCursorStore from "@/hooks/useCursorStore";
import { useGSAP } from "@gsap/react";
import { OS, useOs } from "@mantine/hooks";
import gsap from "gsap";
import { FC, useEffect, useLayoutEffect, useRef } from "react";

interface CursorProps {}

const Cursor: FC<CursorProps> = ({}) => {
  const os: OS = useOs();

  const showCustomCursor =
    os !== "ios" && os !== "android" && os !== "undetermined";

  if (!showCustomCursor) return null;

  return (
    <div
      id="cursor-container"
      className="pointer-events-none fixed inset-0 z-500 select-none">
      <CustomCursor />
    </div>
  );
};

export default Cursor;

const CustomCursor: FC = () => {
  const pointer = useRef<HTMLDivElement>(null);

  const { label, type } = useCursorStore();
  useLayoutEffect(() => {
    gsap.set(pointer.current, {
      xPercent: -50,
      yPercent: -50,
    });
  });

  useGSAP(
    () => {
      const isHovered =
        type === "hover" || type === "label" || type === "weekly";
      gsap.to(pointer.current, { scale: isHovered ? 2.5 : 1, duration: 0.2 });
    },
    { scope: pointer, dependencies: [type] },
  );

  useEffect(() => {
    const setCursorX = gsap.quickTo(pointer.current, "x", { duration: 0.15 });
    const setCursorY = gsap.quickTo(pointer.current, "y", { duration: 0.15 });

    const onPointerMove = (e: PointerEvent) => {
      setCursorX(e.clientX);
      setCursorY(e.clientY);
    };

    document.body.addEventListener("pointermove", onPointerMove);

    return () => {
      document.body.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div
      ref={pointer}
      className={`pointer-events-none absolute size-4  overflow-hidden rounded-full bg-secondary-foreground  flex items-center justify-center ${
        type === "hover"
          ? "bg-primary! border-0!  size-10"
          : type === "label"
            ? "bg-primary/60! backdrop-blur-[2px] size-12 border-0! "
            : type === "weekly"
              ? "bg-primary/80! backdrop-blur-[2px] size-28  rounded-2xl"
              : ""
      }`}>
      {type === "label" && (
        <span className="text-xs uppercase scale-50 whitespace-nowrap text-white font-serif ">
          [ {label} ]
        </span>
      )}
      {type === "weekly" && (
        <span className="text-xl uppercase scale-50  text-white font-serif ">
          {label}
        </span>
      )}

      {/* {type === "hover" && "✨"} */}
      {type === "hover" && <div className="relative size-6">{label}</div>}
    </div>
  );
};
