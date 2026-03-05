"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function BookingsTable({ bookings }: { bookings: any[] }) {
  return (
    <div className="rounded-xl border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Guests</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-10 text-muted-foreground">
                No confirmed bookings yet.
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <Badge className="rounded-full">{b.status}</Badge>
                </TableCell>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>
                  {b.tableInquiry?.bookingAt
                    ? new Date(b.tableInquiry.bookingAt).toLocaleString(
                        "en-IN",
                        { dateStyle: "medium", timeStyle: "short" },
                      )
                    : "-"}
                </TableCell>
                <TableCell>{b.tableInquiry?.guests ?? "-"}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {b.email ?? "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {b.phone ?? "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
