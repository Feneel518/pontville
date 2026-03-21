import { Footer } from "@/components/frontend/Footer";
import Navbar from "@/components/frontend/Navbar";
import Cursor from "@/components/global/Cursor";
import WhatsAppFloating from "@/components/global/WhatsappFloating";
import { auth } from "@/lib/auth/auth";
import { baseMetadata } from "@/lib/helpers/seo";
import { slugify } from "@/lib/helpers/SlugHelper";
import { prisma } from "@/lib/prisma/db";
// import "mapbox-gl/dist/mapbox-gl.css";
import type { Metadata } from "next";
import { Amarante, Inter } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import "mapbox-gl/dist/mapbox-gl.css";

export const metadata: Metadata = baseMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let restaurant = await prisma.restaurant.findFirst({
    select: {
      logoUrl: true,
      name: true,
      tagline: true,
      city: true,
      state: true,
      email: true,
      phone: true,
      instagramUrl: true,
      facebookUrl: true,
      hoursJson: true,
      mapLat: true,
      addressLine: true,
      mapLng: true,
    },
  });

  const user = await auth.api.getSession({
    headers: await headers(),
  });

  let hasDashboard = false;

  if (user?.user) {
    const allowed = await prisma.allowedUser.findUnique({
      where: { email: user?.user.email, isActive: true, role: "ADMIN" },
    });

    hasDashboard = allowed ? true : false;
  }

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: "The Pontville Pub",
        hoursJson: {
          restaurant: "10:00 to 21:00",
          notes: "",
        },
        allowIndexing: true,
        slug: slugify("The Pontville Pub"),
      },
    });
  }

  return (
    <div className="">
      <Navbar
        restaurantDetails={restaurant}
        allowedDashboard={hasDashboard}
        user={user?.user}></Navbar>
      <div className="flex-1 min-h-screen">{children}</div>
      <Toaster richColors />
      <WhatsAppFloating
        phone={restaurant.phone?.replace(/\s+/g, "") ?? ""} // ← your number (NO +)
        message="Hi, I’d like to place an order!"
      />
      <Cursor></Cursor>
      <Footer
        address={restaurant.addressLine}
        logoUrl={restaurant.logoUrl}
        name={restaurant.name}
        tagline={restaurant.tagline}
        city={restaurant.city}
        email={restaurant.email}
        facebookUrl={restaurant.facebookUrl}
        hoursJson={restaurant.hoursJson}
        instagramUrl={restaurant.instagramUrl}
        phone={restaurant.phone}
        state={restaurant.state}
        lat={restaurant.mapLat}
        lng={restaurant.mapLng}></Footer>
    </div>
  );
}
