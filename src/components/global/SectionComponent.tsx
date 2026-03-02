import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";

interface SectionComponentProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

const SectionComponent: FC<SectionComponentProps> = ({
  children,
  className,
  id,
}) => {
  return (
    <section
      id={id}
      className={cn(
        "w-full px-6 pt-10  md:px-12 md:py-20 lg:px-20  space-y-12 ",
        className,
      )}>
      <div className="w-full md:space-y-12 space-y-6">{children}</div>
    </section>
  );
};

export default SectionComponent;
