import { cn } from "@/lib/utils";
import { FC } from "react";

interface HeadingProps {
  label: string;
  className?: string;
}

const Heading: FC<HeadingProps> = ({ label, className }) => {
  return (
    <h2
      className={cn(
        "font-serif uppercase text-[clamp(60px,8vw,80px)] leading-tight",
        className,
      )}>
      {label}
    </h2>
  );
};

export default Heading;
