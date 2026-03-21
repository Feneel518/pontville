import { FC } from "react";

import Image from "next/image";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface WhoWeAreProps {}

export const aboutAccordion = [
  {
    value: "concept",
    title: "Our Concept",
    description:
      "At Pontville Pub, our concept is rooted in genuine country hospitality. We blend historic charm with a relaxed, welcoming atmosphere where guests can unwind, connect, and celebrate. Whether it's a casual lunch, a family dinner, or an evening with friends, every experience is designed to feel effortless and memorable.",
  },
  {
    value: "cuisine",
    title: "Our Cuisine",
    description:
      "Our cuisine focuses on wholesome country dining with a modern touch. From hearty pub classics to freshly prepared seasonal dishes and handcrafted pizzas, every plate is made with quality ingredients and generous portions. We aim to offer comforting flavours that suit every appetite, any day of the week.",
  },
  {
    value: "team",
    title: "Our Team",
    description:
      "Behind every great experience is a passionate team. Our staff are dedicated to delivering warm, attentive service that feels personal and authentic. From the kitchen to the bar, each member of our team shares a commitment to quality, consistency, and creating an atmosphere where every guest feels at home.",
  },
];

const WhoWeAre: FC<WhoWeAreProps> = ({}) => {
  return (
    <SectionComponent className="pb-20">
      <div className="grid md:grid-cols-3 gap-12">
        <div className="w-full min-h-[550px] h-full relative max-md:hidden">
          <Image
            src={"/gallery/2.jpg"}
            alt="image"
            fill
            className="object-cover"></Image>
        </div>
        <div className="col-span-2">
          <Heading label="Who We Are" className=""></Heading>
          <Accordion
            type="single"
            collapsible
            defaultValue="shipping"
            className="mt-4">
            {aboutAccordion.map((f, index) => {
              return (
                <AccordionItem value={f.value}>
                  <AccordionTrigger className="font-sans text-3xl">
                    {f.title}
                  </AccordionTrigger>
                  <AccordionContent className="font-mono">
                    {f.description}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </SectionComponent>
  );
};

export default WhoWeAre;
