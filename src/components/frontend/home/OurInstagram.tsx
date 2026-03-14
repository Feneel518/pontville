"use client";

import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import ArrowButton from "@/components/ui/ArrowButton";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import { FC } from "react";

interface OurInstagramProps {
  insta1: string;
  insta2: string;
  insta3: string;
  insta4: string;
  instaLink: string | null | undefined;
  facebookLink: string | null | undefined;
}

const OurInstagram: FC<OurInstagramProps> = ({
  insta1,
  insta2,
  insta3,
  insta4,
  facebookLink,
  instaLink,
}) => {
  const isMobile = useIsMobile();
  return (
    <SectionComponent className="max-md:pb-24">
      <Heading
        label="Our Instagram"
        className="text-wrap leading-tight"></Heading>
      <div className="grid md:grid-cols-4 gap-8 relative ">
        <div className="h-[350px] w-full  relative">
          <Image
            src={insta1 ?? "/sideImage.jpg"}
            alt="image"
            fill
            className="object-cover"></Image>
        </div>
        <div className="h-[500px] max-md:h-[350px] w-full relative">
          <Image
            src={insta2 ?? "/sideImage.jpg"}
            alt="image"
            fill
            className="object-cover"></Image>
        </div>
        <div className="h-[400px] max-md:h-[350px] w-full relative place-self-end">
          <Image
            src={insta3 ?? "/sideImage.jpg"}
            alt="image"
            fill
            className="object-cover"></Image>
        </div>
        <div className="h-[400px] max-md:h-[350px] w-full relative">
          <Image
            src={insta4 ?? "/sideImage.jpg"}
            alt="image"
            fill
            className="object-cover"></Image>
        </div>

        <div className="w-full absolute -bottom-16 flex items-center justify-between gap-8 max-md:ml-2">
          <div className="absolute right-0 bottom-0 ">
            <ArrowButton
              newTab
              direction="right"
              label="Instagram"
              href={instaLink ?? "#"}></ArrowButton>
          </div>
          <div className="absolute left-0 bottom-0 ">
            <ArrowButton
              newTab
              direction={"left"}
              label="Facebook"
              href={facebookLink ?? "#"}></ArrowButton>
          </div>
        </div>
      </div>
    </SectionComponent>
  );
};

export default OurInstagram;
