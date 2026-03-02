import Heading from "@/components/global/Heading";
import SectionComponent from "@/components/global/SectionComponent";
import ArrowButton from "@/components/ui/ArrowButton";
import Image from "next/image";
import { FC } from "react";

interface AboutSectionProps {}

const AboutSection: FC<AboutSectionProps> = ({}) => {
  return (
    <SectionComponent className="">
      <div className="grid gap-12 md:pt-20 md:grid-cols-2">
        <aside className="flex flex-col justify-between">
          <div className="md:max-w-[80%] space-y-4">
            <Heading label="About Us"></Heading>
            <div className="space-y-4   text-sm md:text-base ">
              <p>
                Established in 1835, The Crown Inn is a historic country pub in
                the heart of Pontville, offering genuine hospitality in a
                relaxed and welcoming setting. Loved by locals and visitors
                alike, it’s a place to unwind, connect, and enjoy the charm of a
                true country hotel.
              </p>

              <p>
                From coffee and cake to hearty bistro meals, relaxed bar
                service, and Keno, The Crown Inn caters to every occasion. Open
                seven days a week, we’re proud to continue a long-standing
                tradition of good food, friendly service, and community spirit.
              </p>
            </div>
          </div>
          {/* Desktop CTA */}
          <div className="hidden md:block mt-20">
            <ArrowButton href="/about" direction="right" label="Learn More" />
          </div>
        </aside>
        <aside className="grid grid-cols-2 gap-4 md:items-end md:gap-12">
          <div className="relative aspect-4/5 w-full md:aspect-4/5">
            <Image
              src="/mainImage.jpg"
              alt="About The Crown Inn"
              fill
              className="object-cover rounded-sm"
            />
          </div>

          <div className="relative aspect-square w-full ">
            <Image
              src="/sideImage.jpg"
              alt="The Crown Inn interior"
              fill
              className="object-cover rounded-sm"
            />
          </div>
        </aside>
      </div>
      <div className="md:hidden  ">
        <ArrowButton href="/about" direction="right" label="Learn More" />
      </div>
    </SectionComponent>
  );
};

export default AboutSection;
