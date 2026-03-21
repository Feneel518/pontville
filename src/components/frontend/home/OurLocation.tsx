import { FC } from "react";

import Link from "next/link";

import Image from "next/image";
import { CONTACTEMAIL } from "@/lib/constants/contactConstants";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import MapboxMap from "./MapBox";

interface OurLocationProps {
  lat: number;
  lng: number;
  email: string;
  hours: any;
  address: string;
  phone: string;
}

const OurLocation: FC<OurLocationProps> = ({
  address,
  email,
  hours,
  lat,
  lng,
  phone,
}) => {
  // Replace with Crown Inn coordinates (Pontville)

  const Mlat = Number(lat) ?? -42.68448319849066;
  const Mlng = Number(lng) ?? 147.26557048966598;

  const gmailLink =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad/i.test(navigator.userAgent)
      ? `googlegmail://co?to=${encodeURIComponent(email ?? CONTACTEMAIL.recepient)}&su=${encodeURIComponent(CONTACTEMAIL.subject)}&body=${encodeURIComponent(CONTACTEMAIL.body)}`
      : `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACTEMAIL.recepient)}&su=${encodeURIComponent(CONTACTEMAIL.subject)}&body=${encodeURIComponent(CONTACTEMAIL.body)}`;

  return (
    <SectionComponent className=" py-20">
      <Heading label="Our location"></Heading>
      <div className="grid gap-12 md:grid-cols-3 md:items-start">
        <aside className="md:col-span-2">
          <MapboxMap lat={Mlat} lng={Mlng} markerLabel="The Pontville Pub" />
        </aside>
        <aside className="flex items-start flex-col gap-12 h-full w-full font-mono md:justify-between ">
          <div className=" space-y-4  text-base  ">
            {Object.entries(hours!).map(([key, value]) => {
              // @ts-ignore
              if (value && value.length > 0) {
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-muted-foreground">
                      {value as string}
                    </span>
                  </div>
                );
              } else null;
            })}
            <p>
              <span className="font-semibold">ADDRESS: </span>
              <Link
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank">
                {address}
              </Link>
            </p>
            <p>
              <span className="font-semibold">EMAIL: </span>
              <Link href={gmailLink} target="_blank" rel="noopener noreferrer">
                {email}
              </Link>
            </p>
            <p>
              <span className="font-semibold">PHONE: </span>{" "}
              <a href={`tel:+${phone?.replace(/\s+/g, "")}`}>+{phone}</a>
            </p>
          </div>

          {/* <div className="relative w-full  aspect-16/8 ">
              <Image
                src={"/BookTable.jpg"}
                alt="image"
                fill
                className="object-cover rounded-sm"></Image>
            </div> */}
        </aside>
      </div>
    </SectionComponent>
  );
};

export default OurLocation;
