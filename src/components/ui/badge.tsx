import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",

        /* Semantic */
        success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        info: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
        warning: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
        error: "bg-red-500/15 text-red-700 dark:text-red-300",

        /* Solid Semantic */
        successSolid: "bg-emerald-600 text-white hover:bg-emerald-600/90",
        infoSolid: "bg-blue-600 text-white hover:bg-blue-600/90",
        warningSolid: "bg-amber-500 text-black hover:bg-amber-500/90",
        errorSolid: "bg-red-600 text-white hover:bg-red-600/90",

        /* Status / Workflow */
        pending: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
        processing: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
        completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        cancelled: "bg-red-500/15 text-red-700 dark:text-red-300",

        /* POS / Orders */
        new: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
        accepted: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
        preparing: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
        ready: "bg-green-500/15 text-green-700 dark:text-green-300",

        /* Utility */
        white: "bg-background text-foreground border border-border",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
