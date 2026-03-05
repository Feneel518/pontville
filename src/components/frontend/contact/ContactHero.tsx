import { FC } from "react";

import { CONTACTEMAIL } from "@/lib/constants/contactConstants";

import Link from "next/link";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import { Input } from "@/components/ui/input";
import ArrowButton from "@/components/ui/ArrowButton";
import MapboxMap from "../home/MapBox";
import ContactForm from "./ContactForm";

interface ContactHeroProps {}

const ContactHero: FC<ContactHeroProps> = ({}) => {
  // Replace with Crown Inn coordinates (Pontville)

  const lat = -42.68448319849066;
  const lng = 147.26557048966598;

  const gmailLink =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad/i.test(navigator.userAgent)
      ? `googlegmail://co?to=${encodeURIComponent(CONTACTEMAIL.recepient)}&su=${encodeURIComponent(CONTACTEMAIL.subject)}&body=${encodeURIComponent(CONTACTEMAIL.body)}`
      : `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACTEMAIL.recepient)}&su=${encodeURIComponent(CONTACTEMAIL.subject)}&body=${encodeURIComponent(CONTACTEMAIL.body)}`;
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
            {/* <div className="flex flex-col gap-12 mt-12">
              <div className="flex  border-b border-secondary-foreground p-2 pl-0 text-base ">
                <Input
                  className="border-none shadow-none font-sans focus:ring-0 pl-0 "
                  placeholder="Your Name"></Input>
              </div>
              <div className="flex  border-b border-secondary-foreground p-2 pl-0 text-base ">
                <Input
                  className="border-none shadow-none font-sans focus:ring-0 pl-0 "
                  placeholder="Your Email"></Input>
              </div>
              <div className="col-span-2 flex flex-col gap-2 font-sans">
                <div className="flex  border-b border-secondary-foreground p-2 pl-0 text-base ">
                  <Input
                    className="border-none shadow-none font-sans focus:ring-0 pl-0 "
                    placeholder="Your Message"></Input>
                  <ArrowButton
                    direction="right"
                    label="Submit"
                    showLabel={false}></ArrowButton>
                </div>
                <p className="text-muted-foreground text-sm">
                  By clicking on the submit button you are agreeing the terms &
                  condition and Privacy Policy.
                </p>
              </div>
            </div> */}
            <ContactForm></ContactForm>
          </div>
          <div className=" space-y-4  text-base  ">
            <p>
              <span className="font-semibold">WORKING HOURS: </span>Monday -
              Sunday, 10:00 - 21:00
            </p>
            <p>
              <span className="font-semibold">ADDRESS: </span>
              <Link
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank">
                365 Brighton Road, Pontville Tasmania 7030
              </Link>
            </p>
            <p>
              <span className="font-semibold">EMAIL: </span>
              <Link href={gmailLink} target="_blank" rel="noopener noreferrer">
                pontvillepub@gmail.com
              </Link>
            </p>
            <p>
              <span className="font-semibold">PHONE: </span>{" "}
              <Link href={"tel:+0362681235"}>+(03) 6268 1235</Link>
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
