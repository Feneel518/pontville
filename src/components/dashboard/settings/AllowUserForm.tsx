"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addUserToDashboard,
  removeAllowedUserAction,
  toggleAllowedUserActiveAction,
} from "@/lib/actions/dashboard/settings/addUserToDashboard";
import { prisma } from "@/lib/prisma/db";
import {
  allowedUSerSchema,
  AllowedUserSchemaRequest,
} from "@/lib/validators/AllowedUserSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AllowedUser } from "@prisma/client";
import { MoreHorizontal, Power, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FC, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AllowUserFormProps {
  allowedUser: AllowedUser[];
}

const AllowUserForm: FC<AllowUserFormProps> = ({ allowedUser }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<AllowedUserSchemaRequest>({
    resolver: zodResolver(allowedUSerSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: AllowedUserSchemaRequest) => {
    startTransition(async () => {
      const res = await addUserToDashboard(values);
      if (!res) {
        toast.error("Something went wrong, updating the venue form.");
      }

      toast.success("User now has access to dashboard.");
      router.refresh();
      form.reset({
        email: "",
      });
    });
  };

  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function toggle(id: string) {
    try {
      setPendingId(id);
      const updated = await toggleAllowedUserActiveAction(id);
      toast.success(updated.isActive ? "User activated" : "User set inactive");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setPendingId(null);
    }
  }

  async function remove(id: string) {
    try {
      setPendingId(id);
      await removeAllowedUserAction(id);
      toast.success("User removed");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Allowed Users:</CardTitle>
        <CardDescription>They can get access to dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-5 flex items-center gap-4"
            onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Venue name</FormLabel>
                  <FormControl>
                    <Input placeholder="Email ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Adding..." : "Add User"}
              </Button>
            </div>
          </form>
        </Form>

        <Separator></Separator>

        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[90px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {allowedUser.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-10 text-center text-sm text-muted-foreground">
                    No allowed users yet.
                  </TableCell>
                </TableRow>
              ) : (
                allowedUser.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>

                    <TableCell>
                      <Badge variant={u.isActive ? "default" : "secondary"}>
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={pendingId === u.id}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggle(u.id)}>
                            <Power className="mr-2 size-4" />
                            {u.isActive ? "Set inactive" : "Activate"}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => remove(u.id)}
                            className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllowUserForm;
