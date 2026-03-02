"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  integrationsSchema,
  type IntegrationsInput,
} from "@/lib/validators/settingsValidator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateIntegrationsAction } from "@/lib/actions/dashboard/settings/updateIntegrationsAcion";

export function IntegrationsForm({
  defaultValues,
}: {
  defaultValues: IntegrationsInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<IntegrationsInput>({
    resolver: zodResolver(integrationsSchema),
    defaultValues,
  });

  const onSubmit = (values: IntegrationsInput) => {
    startTransition(async () => {
      const res = await updateIntegrationsAction(values);
      if (!res.ok) {
        toast.error("Something went wrong, updating the venue form.");
      }

      toast.success("Your settings were updated.");
      router.refresh();
    });
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>
          Tokens and links used across the site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="mapLat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map Latitude</FormLabel>
                    <FormControl>
                      <Input placeholder="-42.7…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mapLng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map Longitude</FormLabel>
                    <FormControl>
                      <Input placeholder="147.5…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="uberEatsUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uber Eats URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.ubereats.com/…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
