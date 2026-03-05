import { FC } from "react";

import Image from "next/image";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import { Button } from "@/components/ui/button";

interface FunctionEventsProps {}

const FunctionEvents: FC<FunctionEventsProps> = ({}) => {
  return (
    <SectionComponent className="px-0 md:px-0 lg:px-0">
      <div className="">
        <div className="w-full max-md:h-screen md:aspect-3/1 relative">
          <div className="absolute flex items-center justify-center inset-0  z-30">
            <div className="md:w-[65%] md:h-[60%] h-full bg-background/60 md:bg-background/30 md:backdrop-blur-xs flex items-center justify-center flex-col gap-4 p-2">
              <Heading
                label="Private Functions & Celebrations"
                className="text-wrap text-center leading-20! w-full  text-[clamp(28px,8vw,80px)]  "></Heading>
              <p className="md:text-xl md:w-1/2 text-center">
                Birthdays, engagements, work parties—tell us what you need and
                we’ll tailor the setup, menu, and space.
              </p>
              <Button variant={"elegant"} className="w-80 mt-8">
                Explore Functions
              </Button>
            </div>
          </div>
          <Image
            src={"/Book.jpg"}
            alt="Book Table"
            fill
            className="object-cover origin-bottom"></Image>
        </div>
      </div>
    </SectionComponent>
  );
};

export default FunctionEvents;
