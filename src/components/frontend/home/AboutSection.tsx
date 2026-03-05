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
                Serving travellers since 1835, Pontville Pub is one of the
                oldest pubs in the Hobart region and a proud part of Tasmania’s
                rich history. Located in the charming township of Pontville, the
                pub has been welcoming locals, visitors, and travellers for
                nearly two centuries.
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
            <ArrowButton href="/about" direction="right" label="Learn More" />
          </div>
        </aside>
        <aside className="grid grid-cols-2 gap-4 md:items-end md:gap-12">
          <div className="relative aspect-4/5 w-full md:aspect-4/5">
            <Image
              src="/about1.jpg"
              alt="About The Crown Inn"
              fill
              className="object-cover rounded-sm"
            />
          </div>

          <div className="relative aspect-square w-full ">
            <Image
              src="/about2.jpg"
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
