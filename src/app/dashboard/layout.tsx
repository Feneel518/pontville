import { FC } from "react";

import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/ui/side/app-sidebar";
import DashboardBreadcrumbs from "@/components/ui/side/DashboardBreadcrumbs";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/checks/requireAuth";
import { prisma } from "@/lib/prisma/db";

interface layoutProps {
  children: React.ReactNode;
}

const layout: FC<layoutProps> = async ({ children }) => {
  const user = await requireAuth();

  const restaurant = await prisma.restaurant.findFirst({
    select: {
      logoUrl: true,
    },
  });

  
  return (
    <SidebarProvider>
      <AppSidebar logo={restaurant?.logoUrl} user={user.user}/>
      <SidebarInset>
        <header className="flex h-14 lg:h-24 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1  p-2 cursor-pointer" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-10"
            />
            <DashboardBreadcrumbs></DashboardBreadcrumbs>
          </div>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default layout;
