import { Footer } from "@/components/frontend/Footer";
import Navbar from "@/components/frontend/Navbar";
import Cursor from "@/components/global/Cursor";
import { slugify } from "@/lib/helpers/SlugHelper";
import { prisma } from "@/lib/prisma/db";
// import "mapbox-gl/dist/mapbox-gl.css";
import type { Metadata } from "next";
import { Amarante, Inter } from "next/font/google";
import { Toaster } from "sonner";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const amarante = Amarante({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Crown Inn",
  description: "Premium dining, cocktails, and events.",
};

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
      mapLng: true,
    },
  });

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
      <Navbar restaurantDetails={restaurant}></Navbar>
      <div className="flex-1 min-h-screen">{children}</div>
      <Toaster richColors />
      {/* <Cursor></Cursor> */}
      <Footer
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
