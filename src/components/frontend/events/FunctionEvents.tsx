import { FC } from "react";

import Image from "next/image";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import { Button } from "@/components/ui/button";
import { BookTableButton } from "@/components/global/BookTableButton";

interface FunctionEventsProps {}

const FunctionEvents: FC<FunctionEventsProps> = ({}) => {
  return (
    <SectionComponent className="px-0 md:px-0 lg:px-0">
      <div className="">
        <div className="w-full max-md:h-screen md:aspect-3/1 relative">
          <div className="absolute flex items-center justify-center inset-0  z-30">
            <div className="md:w-[65%] md:h-[60%] h-full bg-background/60 md:bg-background/30 md:backdrop-blur-xs flex items-center justify-center flex-col gap-4 p-2">
              <Heading
                label="Functions, Celebrations & Catering"
                className="text-wrap text-center leading-20! w-full  text-[clamp(28px,8vw,80px)]  "></Heading>
              <p className="md:text-xl md:w-2/3 text-center">
                Celebrate life’s special moments with us. Whether you’re
                planning a private function, a corporate gathering, or require
                catering for your event, our team will craft a personalized
                experience to suit your occasion.
              </p>
              <BookTableButton></BookTableButton>
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
