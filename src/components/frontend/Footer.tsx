"use client";

import Link from "next/link";

import { Input } from "@/components/ui/input";
import { CONTACTEMAIL } from "@/lib/constants/contactConstants";
import { IconRipple } from "@tabler/icons-react";
import Image from "next/image";

import ArrowButton from "../ui/ArrowButton";
import SectionComponent from "../global/SectionComponent";

const nav = [
  { label: "Menu", href: "/menu" },

  { label: "Events", href: "/events" },

  { label: "Functions", href: "/functions" },

  { label: "About", href: "/about" },

  { label: "Contact", href: "/contact" },
];

const legal = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer({
  logoUrl,
  name,
  tagline,
  city,
  email,
  facebookUrl,
  address,
  hoursJson,
  instagramUrl,
  phone,
  state,
  lat,
  lng,
}: {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  email: string | null;
  phone: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  hoursJson: any;
  lat: number | null;
  lng: number | null;
}) {
  const gmailLink =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad/i.test(navigator.userAgent)
      ? `googlegmail://co?to=${encodeURIComponent(email ?? CONTACTEMAIL.recepient)}&su=${encodeURIComponent(CONTACTEMAIL.subject)}&body=${encodeURIComponent(CONTACTEMAIL.body)}`
      : `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email ?? CONTACTEMAIL.recepient)}&su=${encodeURIComponent(CONTACTEMAIL.subject)}&body=${encodeURIComponent(CONTACTEMAIL.body)}`;

  const contactItems = [
    {
      label: "Address",
      value: `${address}, ${city}, ${state}, Australia`,
      href: `https://www.google.com/maps?q=${lat},${lng}`,
      external: true,
    },
    {
      label: "Email",
      value: `${email}`,
      href: gmailLink,
      external: true,
    },
    {
      label: "Phone",
      value: `${phone}`,
      href: `tel:${phone}`,
      external: false,
    },
  ];
  const socialLinks = [
    {
      label: "Instagram",
      href: `${instagramUrl}`,
    },
    {
      label: "Facebook",
      href: `${facebookUrl}`,
    },
  ];

  return (
    <>
      <SectionComponent className="border-t border-secondary-foreground ">
        <div className="grid md:grid-cols-4 grid-cols-2 gap-12  border-b border-secondary-foreground pb-12">
          <div className="">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <div className="relative size-20 md:size-14 lg:size-20 shrink-0 -mt-2 -ml-6">
                <Image
                  src={logoUrl ?? "/logonew.svg"}
                  alt={name}
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <div className="min-w-0 leading-tight -ml-4">
                <p className="font-serif tracking-tight  text-xl sm:text-xl lg:text-[30px] ">
                  {name}
                </p>

                <p className="font-sans tracking-widest text-[10px] -mt-2 sm:text-[11px] md:text-xs text-foreground/70 flex items-center gap-2">
                  <span className=" ml-1">{tagline}</span>
                  <IconRipple strokeWidth={0.75} className="shrink-0" />
                </p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-2">
            <div className="flex flex-col gap-1 font-sans">
              <h3 className="font-serif text-2xl">Menu</h3>

              {nav.map((link) => {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`hover:underline hover:underline-offset-4 transition-all duration-200 ease-in-out ${link.label === "" && "pointer-events-none"}`}>
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-1">
              <p className="hover:underline hover:underline-offset-4 cursor-pointer text-nowrap">
                Book a Table
              </p>
              <p className="hover:underline hover:underline-offset-4 cursor-pointer text-nowrap">
                Leave Feedback
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 font-sans">
            <h3 className="font-serif text-2xl">Contact</h3>
            {contactItems.map((item) => (
              <p key={item.label}>
                <Link
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="hover:underline hover:underline-offset-4">
                  {item.value ? item.value : ""}
                </Link>
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-2 font-sans">
            <h3 className="font-serif text-2xl">Socials</h3>
            {socialLinks.map((item) => {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="hover:underline hover:underline-offset-4">
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 font-sans">
            <h3 className="font-serif text-2xl">Open Hours</h3>
            {Object.entries(hoursJson).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="text-muted-foreground">{value as string}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 font-sans w-3/4 mt-8">
            <p className="">
              Great food, crafted drinks, and a lively atmosphere; the perfect
              place to relax and enjoy with friends. 🍻
            </p>
          </div>

          <div className="col-span-2 flex flex-col gap-2 font-sans">
            <h3 className="font-serif text-2xl">Stay Tuned</h3>
            <div className="flex  border-b border-secondary-foreground p-2 pl-0 text-base ">
              <Input
                className="border-none shadow-none font-sans focus:ring-0 pl-0 "
                placeholder="Your email"></Input>
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
        </div>
      </SectionComponent>
      <div className="md:-mt-12 max-md:py-4 text-center">
        <p className="text-xs font-sans">
          Made with <span aria-hidden>❤️</span> and brains by{" "}
          <a
            href="https://merrymatrix.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline hover:underline-offset-4">
            Merry Matrix
          </a>
        </p>
      </div>
    </>
  );
}
