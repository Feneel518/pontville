"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createContactAction } from "@/lib/actions/frontend/contact/createContactAction";
import { ContactInput, contactSchema } from "@/lib/validators/contactValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ContactFormProps {}

const ContactForm: FC<ContactFormProps> = ({}) => {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    } as any,
  });

  async function onSubmit(values: ContactInput) {
    try {
      setLoading(true);

      // Convert datetime-local string -> Date for TABLE / EVENT date
      const payload: ContactInput = { ...values };

      await createContactAction(payload);

      toast.success("Inquiry sent! We'll get back to you soon.");

      form.reset({
        ...form.getValues(),
        name: "",
        email: "",
        phone: "",
        notes: "",
      } as any);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send inquiry");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 flex flex-col gap-2 mt-12">
        {/* Type */}

        {/* Contact */}
        <div className="flex  border-b border-secondary-foreground p-2 pl-0 text-base">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    className="border-none shadow-none font-sans focus-visible:ring-0 pl-0  w-full text-2xl!"
                    placeholder="Your Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex  border-b border-secondary-foreground p-2 pl-0 text-base">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    className="border-none shadow-none font-sans focus-visible:ring-0 pl-0  w-full text-2xl!"
                    type="email"
                    placeholder="Your Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex  border-b border-secondary-foreground p-2 pl-0 text-base">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    className="border-none shadow-none font-sans focus-visible:ring-0 pl-0  w-full text-2xl!"
                    placeholder="Your Phone"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex  border-b border-secondary-foreground p-2 pl-0 text-base">
          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Textarea
                    rows={4}
                    className="border-none shadow-none font-sans focus-visible:ring-0 pl-0  w-full text-2xl!"
                    placeholder="Your Message"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <p className="text-muted-foreground text-sm">
          By clicking on the submit button you are agreeing the terms &
          condition and Privacy Policy.
        </p>

        <Button disabled={loading} type="submit" className="w-full">
          {loading ? "Sending…" : "Send inquiry"}
        </Button>
      </form>
    </Form>
  );
};

export default ContactForm;
