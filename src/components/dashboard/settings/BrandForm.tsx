"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  brandSchema,
  type BrandInput,
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
import { updateBrandAction } from "@/lib/actions/dashboard/settings/updateBrandAction";
import { FileUpload } from "@/components/global/FileUpload";
// import { FileUpload } from "@/components/global/FileUpload";

export function BrandForm({ defaultValues }: { defaultValues: BrandInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<BrandInput>({
    resolver: zodResolver(brandSchema),
    defaultValues,
  });

  const onSubmit = (values: BrandInput) => {
    startTransition(async () => {
      const res = await updateBrandAction(values);
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
        <CardTitle>Brand & Social</CardTitle>
        <CardDescription>
          Social links and images used across the site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      endpoint="restaurantImage"
                      value={field.value}
                      onChange={field.onChange}
                      label="Upload logo"
                      hint="PNG or JPG. Recommended: 512×512."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ogImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…/og.jpg" {...field} />
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
