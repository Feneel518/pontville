"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookTableForm } from "./BookTableForm";
import { ResponsiveModal } from "./ResponsiveModal";

export function BookTableButton({
  variant = "elegantFull",
  trigger,
  type,
}: {
  variant?: "elegant" | "elegantFull";
  trigger?: React.ReactNode;
  type?: "EVENT" | "TABLE";
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      trigger={
        trigger ?? (
          <Button size={"lg"} variant={variant}>
            Book a Table{" "}
          </Button>
        )
      }>
      <BookTableForm
        onSuccess={() => setOpen(false)}
        eventType={type}></BookTableForm>
    </ResponsiveModal>
  );
}
