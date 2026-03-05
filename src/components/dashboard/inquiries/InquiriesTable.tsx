"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


function statusBadgeVariant(status: string) {
  if (status === "PENDING") return "secondary";
  if (status === "ACCEPTED") return "default";
  if (status === "REJECTED") return "destructive";
  return "outline";
}

export function InquiriesTable({ inquiries }: { inquiries: any[] }) {
  const [selected, setSelected] = React.useState<any | null>(null);
  const router = useRouter();
  const sp = useSearchParams();

  const status = sp.get("status") ?? "";
  const type = sp.get("type") ?? "";

  function setParam(key: string, val: string) {
    const params = new URLSearchParams(sp.toString());
    if (!val) params.delete(key);
    else params.set(key, val);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <Select value={status} onValueChange={(v) => setParam("status", v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={(v) => setParam("type", v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="TABLE">Table</SelectItem>
              <SelectItem value="EVENT">Event</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={() => router.refresh()}>
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">When</TableHead>
              <TableHead className="hidden md:table-cell">Guests</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {inquiries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground">
                  No inquiries found.
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((i) => {
                const when =
                  i.type === "TABLE"
                    ? i.tableInquiry?.bookingAt
                    : i.eventInquiry?.eventDate;

                const guests =
                  i.type === "TABLE"
                    ? i.tableInquiry?.guests
                    : i.eventInquiry?.expectedGuests;

                return (
                  <TableRow key={i.id}>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        {i.type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={statusBadgeVariant(i.status)}
                        className="rounded-full">
                        {i.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-medium">{i.name}</TableCell>

                    <TableCell className="hidden md:table-cell">
                      {when
                        ? new Date(when).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "-"}
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {guests ?? "-"}
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {new Date(i.createdAt).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelected(i)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* <InquiryDetailsSheet
        inquiry={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      /> */}
    </div>
  );
}
