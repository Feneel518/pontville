import { BookTableButton } from "@/components/global/BookTableButton";
import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FC } from "react";

interface HowToBookProps {
  tabelImage: string | undefined | null;
}

const HowToBook: FC<HowToBookProps> = ({ tabelImage }) => {
  return (
    <SectionComponent className="px-0 md:px-0 lg:px-0">
      <div className="">
        <div className="w-full max-md:h-screen md:aspect-3/1 relative">
          <div className="absolute flex items-center justify-center inset-0  z-30">
            <div className="md:w-[65%] md:h-[60%] h-fit max-md:py-16 rounded-sm bg-background/60 md:bg-background/30 md:backdrop-blur-xs flex items-center justify-center flex-col gap-4 p-2">
              <Heading
                label="Reserve Your Table"
                className="text-wrap text-center leading-tight w-full "></Heading>
              <p className="md:text-xl md:w-1/2 text-center">
                Ready for a great dining experience? <br />
                Book your table in seconds and enjoy a memorable time with us.
              </p>
              <BookTableButton />
            </div>
          </div>
          <Image
            src={tabelImage ?? "/Book.jpg"}
            alt="Book Table"
            fill
            className="object-cover origin-bottom"></Image>
        </div>
      </div>
    </SectionComponent>
  );
};

export default HowToBook;
