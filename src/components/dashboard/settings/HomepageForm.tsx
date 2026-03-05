"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  HomepageInput,
  homepageSchema,
} from "@/lib/validators/settingsValidator";

import { FileUpload } from "@/components/global/FileUpload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { updateHomepage } from "@/lib/actions/dashboard/settings/updateHomepage";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import { FileUpload } from "@/components/global/FileUpload";

export function HomepageForm({
  defaultValues,
}: {
  defaultValues: HomepageInput;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<HomepageInput>({
    resolver: zodResolver(homepageSchema),
    defaultValues,
  });

  const onSubmit = (values: HomepageInput) => {
    startTransition(async () => {
      const res = await updateHomepage(values);
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
            <FormField
              control={form.control}
              name="homepageMainImage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      endpoint="restaurantImage"
                      value={field.value}
                      onChange={field.onChange}
                      label="Upload Home Page Main Image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="homepageSideImage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      endpoint="restaurantImage"
                      value={field.value}
                      onChange={field.onChange}
                      label="Upload Home Page Side Image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="homePageBookATableImage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      endpoint="restaurantImage"
                      value={field.value}
                      onChange={field.onChange}
                      label="Upload Home Page Book A Table Image"
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
