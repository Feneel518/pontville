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
                Originally established as the Crown Inn, the venue has long been
                a landmark along the historic route between Hobart and
                Launceston. Over the years, it has remained a gathering place
                where people come together to enjoy great food, refreshing
                drinks, and genuine Tasmanian hospitality.
              </p>

              <p>
                Today, Pontville Pub blends its historic charm with a relaxed
                and welcoming dining experience. Our menu features classic pub
                favourites along with delicious meals made with quality
                ingredients, all served in a warm and friendly atmosphere.
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
