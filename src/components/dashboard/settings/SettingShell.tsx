import { Separator } from "@/components/ui/separator";
import { ReactNode } from "react";

export function SettingsShell({
  title,
  subtitle,
  nav,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className=" w-full ">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <Separator className="mt-4"></Separator>

      <div className="mt-10 grid md:gap-10 lg:grid-cols-12 md:items-start">
        <aside className="lg:col-span-4">{nav}</aside>
        <main className="lg:col-span-8 space-y-6">{children}</main>
      </div>
    </section>
  );
}
