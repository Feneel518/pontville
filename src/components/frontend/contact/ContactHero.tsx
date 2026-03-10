import { FC } from "react";

import { CONTACTEMAIL } from "@/lib/constants/contactConstants";

import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import Link from "next/link";
import MapboxMap from "../home/MapBox";
import ContactForm from "./ContactForm";
import { prisma } from "@/lib/prisma/db";

interface ContactHeroProps {}

const ContactHero: FC<ContactHeroProps> = async ({}) => {
  const restaurant = await prisma.restaurant.findFirst();

  // Replace with Crown Inn coordinates (Pontville)

  const lat = -42.68448319849066;
  const lng = 147.26557048966598;

  const gmailLink =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad/i.test(navigator.userAgent)
      ? `googlegmail://co?to=${encodeURIComponent(restaurant?.email ?? CONTACTEMAIL.recepient)}&su=${encodeURIComponent(CONTACTEMAIL.subject)}&body=${encodeURIComponent(CONTACTEMAIL.body)}`
      : `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACTEMAIL.recepient)}&su=${encodeURIComponent(CONTACTEMAIL.subject)}&body=${encodeURIComponent(CONTACTEMAIL.body)}`;

  const contactItems = [
    {
      label: "Address",
      value: `${restaurant?.addressLine}, ${restaurant?.city}, ${restaurant?.state}, Australia`,
      href: `https://www.google.com/maps?q=${lat},${lng}`,
      external: true,
    },
    {
      label: "Email",
      value: `${restaurant?.email}`,
      href: gmailLink,
      external: true,
    },
    {
      label: "Phone",
      value: `${restaurant?.phone}`,
      href: `tel:${restaurant?.phone}`,
      external: false,
    },
  ];

  return (
    <SectionComponent>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-12 justify-between">
          <div className="lex flex-col gap-6">
            <Heading label="Stay Tuned"></Heading>
            <p className="text-lg">
              Don't miss out our news and be the first to know about our new
              products, subscribe to our hot offers and newsletter.
            </p>
            <ContactForm></ContactForm>
          </div>
          <div className=" space-y-4  text-base  ">
            {Object.entries(restaurant?.hoursJson!).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="text-muted-foreground">{value as string}</span>
              </div>
            ))}
            <p>
              <span className="font-semibold">ADDRESS: </span>
              <Link
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank">
                {restaurant?.addressLine}
              </Link>
            </p>
            <p>
              <span className="font-semibold">EMAIL: </span>
              <Link href={gmailLink} target="_blank" rel="noopener noreferrer">
                {restaurant?.email}
              </Link>
            </p>
            <p>
              <span className="font-semibold">PHONE: </span>{" "}
              <Link href={`tel:${restaurant?.phone}`}>{restaurant?.phone}</Link>
            </p>
          </div>
        </div>

        <div className="">
          <MapboxMap
            height="h-[70vh]"
            lat={lat}
            lng={lng}
            markerLabel="The Crown Inn"
          />
        </div>
      </div>
    </SectionComponent>
  );
};

export default ContactHero;
