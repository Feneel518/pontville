"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { seoSchema, type SeoInput } from "@/lib/validators/settingsValidator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { updateSeoAction } from "@/lib/actions/dashboard/settings/updateSeoActiuon";

export function SeoForm({ defaultValues }: { defaultValues: SeoInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<SeoInput>({
    resolver: zodResolver(seoSchema),
    defaultValues,
  });

  const onSubmit = (values: SeoInput) => {
    form.setValue("metaTitle", values.metaTitle ?? "");
    form.setValue("metaDescription", values.metaDescription ?? "");
    form.setValue("allowIndexing", values.allowIndexing ? true : false);

    startTransition(async () => {
      const res = await updateSeoAction(values);
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
        <CardTitle>SEO</CardTitle>
        <CardDescription>
          Search previews and indexing controls.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta title</FormLabel>
                  <FormControl>
                    <Input placeholder="Crown Inn — Pontville" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[90px]"
                      placeholder="A country pub in historic Pontville…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowIndexing"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-xl border p-4">
                  <div className="space-y-1">
                    <FormLabel>Allow indexing</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Turn off to noindex the website (use carefully).
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
