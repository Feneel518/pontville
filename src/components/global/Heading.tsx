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
        "font-serif  text-[clamp(30px,6vw,40px)] leading-tight",
        className,
      )}>
      {label}
    </h2>
  );
};

export default Heading;
