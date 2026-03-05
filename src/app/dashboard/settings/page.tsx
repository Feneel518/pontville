import AllowUserForm from "@/components/dashboard/settings/AllowUserForm";
import { BrandForm } from "@/components/dashboard/settings/BrandForm";
import { HomepageForm } from "@/components/dashboard/settings/HomepageForm";
import { HoursForm } from "@/components/dashboard/settings/HoursForm";
import { InstagramForm } from "@/components/dashboard/settings/InstagramForm";
import { IntegrationsForm } from "@/components/dashboard/settings/IntegrationsForm";

import { SeoForm } from "@/components/dashboard/settings/SeoForm";
import { SettingsShell } from "@/components/dashboard/settings/SettingShell";
import { SettingsNav } from "@/components/dashboard/settings/SettingsNav";
import { VenueForm } from "@/components/dashboard/settings/VenueForm";
import { slugify } from "@/lib/helpers/SlugHelper";
import { prisma } from "@/lib/prisma/db";
import { Section } from "@/lib/types/settingsSection";
import { HoursEditorInput } from "@/lib/validators/settingsValidator";
import { FC } from "react";

interface pageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const sp = (await searchParams) ?? {};
  const section = (sp.section as Section) ?? "venue";

  const settings =
    (await prisma.restaurant.findFirst()) ??
    (await prisma.restaurant.create({
      data: {
        name: "The Pontville Pub",
        hoursJson: {
          restaurant: "10:00 to 21:00",
          notes: "",
        },
        allowIndexing: true,
        slug: slugify("The Pontville Pub"),
      },
    }));

  const hours = (settings.hoursJson ?? {}) as HoursEditorInput;

    const allowedUsers = await prisma.allowedUser.findMany();
  return (
    <SettingsShell
      title="Settings"
      subtitle="Manage Crown Inn website content, hours, SEO, and integrations."
      nav={<SettingsNav active={section} />}>
      {section === "venue" && (
        <VenueForm
          defaultValues={{
            name: settings.name ?? "Crown Inn",
            tagline: settings.tagline ?? "",
            phone: settings.phone ?? "",
            email: settings.email ?? "",
            addressLine: settings.addressLine ?? "",
            city: settings.city ?? "",
            state: settings.state ?? "",
            postcode: settings.postcode ?? "",
          }}
        />
      )}

      {section === "hours" && (
        <HoursForm
          defaultValues={{
            bar: hours.bar ?? "",
            bistroDinner: hours.bistroDinner ?? "",
            bistroLunch: hours.bistroLunch ?? "",
            pizzaLunch: hours.pizzaLunch ?? "",
            pizzaDinner: hours.pizzaDinner ?? "",
            tea: hours.tea ?? "",
            weeklyHolidays: settings.weeklyHolidays ?? [],
            notes: hours.notes ?? "",
          }}
        />
      )}

      {section === "brand" && (
        <BrandForm
          defaultValues={{
            instagramUrl: settings.instagramUrl ?? "",
            facebookUrl: settings.facebookUrl ?? "",
            logoUrl: settings.logoUrl ?? "",
            ogImageUrl: settings.ogImageUrl ?? "",
          }}
        />
      )}

      {section === "seo" && (
        <SeoForm
          defaultValues={{
            metaTitle: settings.metaTitle ?? "",
            metaDescription: settings.metaDescription ?? "",
            allowIndexing: Boolean(settings.allowIndexing),
          }}
        />
      )}

      {section === "integrations" && (
        <IntegrationsForm
          defaultValues={{
            mapLat:
              (settings as any).mapLat !== null &&
              (settings as any).mapLat !== undefined
                ? String((settings as any).mapLat)
                : "",
            mapLng:
              (settings as any).mapLng !== null &&
              (settings as any).mapLng !== undefined
                ? String((settings as any).mapLng)
                : "",
            uberEatsUrl: (settings as any).uberEatsUrl ?? "",
          }}
        />
      )}

      {section === "homepage" && (
        <HomepageForm
          defaultValues={{
            homepageMainImage: settings.homepageMainImage,
            homePageBookATableImage: settings.homePageBookATableImage,
            homepageSideImage: settings.homepageSideImage,
          }}
        />
      )}
      {section === "instagram" && (
        <InstagramForm
          defaultValues={{
            insta1: settings.insta1,
            insta2: settings.insta2,
            insta3: settings.insta3,
            insta4: settings.insta4,
          }}
        />
      )}
      {section === "allowUser" && <AllowUserForm allowedUser={allowedUsers} />}
    </SettingsShell>
  );
};

export default page;
