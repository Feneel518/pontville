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

export function BookTableButton() {
  const [open, setOpen] = React.useState(false);

  return (
    // <Dialog open={open} onOpenChange={setOpen}>
    //   <DialogTrigger asChild>
    //     <Button>Book a table</Button>
    //   </DialogTrigger>

    //   <DialogContent className="sm:max-w-lg">
    //     <DialogHeader>
    //       <DialogTitle>Book a table</DialogTitle>
    //     </DialogHeader>

    //     <BookTableForm onSuccess={() => setOpen(false)} />
    //   </DialogContent>
    // </Dialog>
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      trigger={<Button>Book a Table</Button>}>
      <BookTableForm onSuccess={() => setOpen(false)}></BookTableForm>
    </ResponsiveModal>
  );
}
