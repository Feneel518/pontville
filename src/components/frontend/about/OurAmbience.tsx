import { FC } from "react";

import Image from "next/image";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import ArrowButton from "@/components/ui/ArrowButton";

interface OurAmbienceProps {}

const OurAmbience: FC<OurAmbienceProps> = ({}) => {
  return (
    <SectionComponent className="">
      <div className="grid gap-12 md:pt-20 md:grid-cols-2">
        <aside className="flex flex-col justify-between">
          <div className="md:max-w-[80%] space-y-4">
            <Heading label="Our Ambience    "></Heading>
            <div className="space-y-4   text-sm md:text-base ">
              <p>
                Our ambience blends timeless country charm with warm, welcoming
                comfort. Natural textures, soft lighting, and thoughtfully
                curated interiors create a space that feels both elegant and
                relaxed. Whether you’re settling in for a quiet afternoon drink
                or gathering with friends for dinner, the atmosphere invites you
                to slow down and truly enjoy the moment.
              </p>

              <p>
                From lively evenings filled with laughter to calm mornings over
                coffee and cake, every corner of the venue carries a sense of
                genuine hospitality. The balance of rustic character and modern
                comfort ensures that every visit feels effortless — a place
                where good food, good company, and a warm setting come together
                naturally.
              </p>
            </div>
          </div>
          {/* Desktop CTA */}
          <div className="hidden md:block mt-20">
            <ArrowButton direction="right" label="Learn More" />
          </div>
        </aside>
        <aside className="grid grid-cols-2 gap-4 md:items-end md:gap-12">
          <div className="relative aspect-4/5 w-full md:aspect-4/5">
            <Image
              src="/gallery/1.jpg"
              alt="About The Crown Inn"
              fill
              className="object-cover rounded-sm"
            />
          </div>

          <div className="relative aspect-square w-full ">
            <Image
              src="/gallery/11.jpg"
              alt="The Crown Inn interior"
              fill
              className="object-cover rounded-sm"
            />
          </div>
        </aside>
      </div>
      <div className="md:hidden  ">
        <ArrowButton direction="right" label="Learn More" />
      </div>
    </SectionComponent>
  );
};

export default OurAmbience;
