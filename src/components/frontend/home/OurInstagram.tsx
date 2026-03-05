import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import ArrowButton from "@/components/ui/ArrowButton";
import Image from "next/image";
import { FC } from "react";

interface OurInstagramProps {
  insta1: string;
  insta2: string;
  insta3: string;
  insta4: string;
}

const OurInstagram: FC<OurInstagramProps> = ({
  insta1,
  insta2,
  insta3,
  insta4,
}) => {
  return (
    <SectionComponent>
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
        <div className="absolute md:right-0 bottom-0 max-md:-bottom-12">
          <ArrowButton direction="right" label="Follow Us"></ArrowButton>
        </div>
      </div>
    </SectionComponent>
  );
};

export default OurInstagram;
