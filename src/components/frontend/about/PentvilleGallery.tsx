import { FC } from "react";

import DynamicMosaic from "./DynamicMosaic";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";

interface PentvilleGalleryProps {}

const PentvilleGallery: FC<PentvilleGalleryProps> = ({}) => {
  const images = [
    { src: "/gallery/1.jpg", alt: "Dining room", width: 1600, height: 1067 },
    { src: "/gallery/2.jpg", alt: "Bar", width: 1200, height: 1600 },
    { src: "/gallery/3.jpg", alt: "Outdoor", width: 1600, height: 900 },
    { src: "/gallery/4.jpg", alt: "Food", width: 1200, height: 900 },
    { src: "/gallery/5.jpg", alt: "Live music", width: 1200, height: 1800 },
    { src: "/gallery/6.jpg", alt: "Food", width: 1200, height: 900 },
    { src: "/gallery/7.jpg", alt: "Dining room", width: 1600, height: 1067 },
    { src: "/gallery/8.jpg", alt: "Outdoor", width: 1600, height: 900 },
    { src: "/gallery/9.jpg", alt: "Bar", width: 1200, height: 1600 },
    { src: "/gallery/10.jpg", alt: "Live music", width: 1200, height: 1800 },
  ];
  return (
    <SectionComponent>
      <Heading label="Our Gallery"></Heading>
      <div className="">
        <DynamicMosaic
          images={images}
          columnsClassName="columns-1 sm:columns-2 lg:columns-3 xl:columns-4"
        />
      </div>
    </SectionComponent>
  );
};

export default PentvilleGallery;
