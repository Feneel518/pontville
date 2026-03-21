// "use client";
// import { FC, useRef } from "react";

// import Image from "next/image";

// import { Music, Sparkles, Users, Utensils } from "lucide-react";
// import useCursorStore from "@/hooks/useCursorStore";
// import SectionComponent from "@/components/global/SectionComponent";
// import Heading from "@/components/global/Heading";
// import ArrowButton from "@/components/ui/ArrowButton";
// import { PromoBanner } from "@prisma/client";
// import { BookTableButton } from "@/components/global/BookTableButton";

// interface WeeklyEventsProps {
//   promos: PromoBanner[];
// }

// export const WEEKLY_EVENTS = [
//   {
//     title: "Live Music Fridays",
//     subtitle: "From 7 PM • Local artists",
//     // icon: Music,
//     image: "/events/live-music.jpg",
//   },
//   {
//     title: "Trivia Thursdays",
//     subtitle: "From 6:30 PM • Prizes to win",
//     // icon: Sparkles,
//     image: "/events/trivia.jpg",
//   },
//   {
//     title: "Midweek Dinner Specials",
//     subtitle: "Wed–Thu • Seasonal menu offers",
//     // icon: Utensils,
//     image: "/events/dinner.jpg",
//   },
//   {
//     title: "Sunday Sessions",
//     subtitle: "Chill afternoon vibes • Family-friendly",
//     // icon: Users,
//     image: "/events/sunday.jpg",
//   },
// ];

// const WeeklyEvents: FC<WeeklyEventsProps> = ({ promos }) => {
//   const ImageOneRef = useRef(null);
//   const ImageTwoRef = useRef(null);
//   const ImageThreeRef = useRef(null);
//   const ImageFourRef = useRef(null);

//   const setCursor = useCursorStore((s) => s.setCursor);
//   const { label, type } = useCursorStore();

//   const onPointerEnter = (index: number) => {
//     setCursor({
//       label: (
//         <>
//           <div className="space-y-1 flex items-center justify-center flex-col p-1">
//             <p className="text-center">{promos[index].title}</p>
//             <p className="text-sm text-wrap text-center ">
//               {promos[index].message}
//             </p>
//           </div>
//         </>
//       ),
//       type: "weekly",
//     });
//   };

//   const onPointerLeave = () => setCursor({ label: null, type: "default" });
//   return (
//     <SectionComponent className="max-md:mb-20">
//       <Heading label="Weekly Lineups"></Heading>
//       <div className="grid md:grid-cols-4 gap-8 relative ">
//         <div
//           ref={ImageOneRef}
//           onPointerEnter={() => onPointerEnter(0)}
//           onPointerLeave={onPointerLeave}
//           className="h-[350px] w-full  relative">
//           <div className="absolute inset-0 flex items-center justify-center z-30 md:hidden">
//             <div className="bg-primary/80! backdrop-blur-[2px] size-44 rounded-sm flex items-center justify-center     text-xl uppercase   text-white font-serif">
//               <>
//                 <div className="space-y-1 flex items-center justify-center flex-col p-1">
//                   <p className="text-center">{promos[0].title}</p>
//                   <p className="text-sm text-wrap text-center ">
//                     {promos[0].message}
//                   </p>
//                 </div>
//               </>
//             </div>
//           </div>
//           <Image
//             src={promos[0].imageUrl ?? "/placeholder.jpg"}
//             alt="image"
//             fill
//             className="object-cover"></Image>
//         </div>
//         <div
//           ref={ImageTwoRef}
//           onPointerEnter={() => onPointerEnter(1)}
//           onPointerLeave={onPointerLeave}
//           className="h-[500px] max-md:h-[350px] w-full relative">
//           <div className="absolute inset-0 flex items-center justify-center z-30 md:hidden">
//             <div className="bg-primary/80! backdrop-blur-[2px] size-44 rounded-sm flex items-center justify-center     text-xl uppercase   text-white font-serif">
//               <>
//                 <div className="space-y-1 flex items-center justify-center flex-col p-1">
//                   <p className="text-center">{promos[1].title}</p>
//                   <p className="text-sm text-wrap text-center ">
//                     {promos[1].message}
//                   </p>
//                 </div>
//               </>
//             </div>
//           </div>
//           <Image
//             src={promos[1].imageUrl ?? "/placeholder.jpg"}
//             alt="image"
//             fill
//             className="object-cover"></Image>
//         </div>
//         <div
//           ref={ImageThreeRef}
//           onPointerEnter={() => onPointerEnter(2)}
//           onPointerLeave={onPointerLeave}
//           className="h-[400px] max-md:h-[350px] w-full relative place-self-end">
//           <div className="absolute inset-0 flex items-center justify-center z-30 md:hidden">
//             <div className="bg-primary/80! backdrop-blur-[2px] size-44 rounded-sm flex items-center justify-center     text-xl uppercase   text-white font-serif">
//               <>
//                 <div className="space-y-1 flex items-center justify-center flex-col p-1">
//                   <p className="text-center">{promos[2].title}</p>
//                   <p className="text-sm text-wrap text-center ">
//                     {promos[2].message}
//                   </p>
//                 </div>
//               </>
//             </div>
//           </div>
//           <Image
//             src={promos[2].imageUrl ?? "/placeholder.jpg"}
//             alt="image"
//             fill
//             className="object-cover"></Image>
//         </div>
//         <div
//           ref={ImageFourRef}
//           onPointerEnter={() => onPointerEnter(3)}
//           onPointerLeave={onPointerLeave}
//           className="h-[400px] max-md:h-[350px] w-full relative">
//           <div className="absolute inset-0 flex items-center justify-center z-30 md:hidden">
//             <div className="bg-primary/80! backdrop-blur-[2px] size-44 rounded-sm flex items-center justify-center     text-xl uppercase   text-white font-serif">
//               <>
//                 <div className="space-y-1 flex items-center justify-center flex-col p-1">
//                   <p className="text-center">{promos[3]?.title}</p>
//                   <p className="text-sm text-wrap text-center ">
//                     {promos[3]?.message}
//                   </p>
//                 </div>
//               </>
//             </div>
//           </div>
//           <Image
//             src={promos[3]?.imageUrl ?? "/placeholder.jpg"}
//             alt="image"
//             fill
//             className="object-cover"></Image>
//         </div>
//         <div className="absolute md:right-0 bottom-0 max-md:-bottom-12">
//           <BookTableButton
//             type="EVENT"
//             trigger={
//               <div className="group flex cursor-pointer items-center z-40 gap-2 md:p-2 md:pl-0 ">
//                 <div
//                   className={`relative h-4 w-[200px] shrink-0 inline-block translate-x-0 transition-transform duration-300 group-hover:-translate-x-2" `}>
//                   <Image
//                     src="/Arrow.svg"
//                     alt="Arrow"
//                     fill
//                     className={`object-contain `}
//                   />
//                 </div>
//                 <div
//                   className={`h-4 flex items-center justify-center  translate-x-0 transition-transform duration-300 group-hover:translate-x-2}`}>
//                   Group Booking
//                 </div>
//               </div>
//             }></BookTableButton>
//         </div>
//       </div>
//     </SectionComponent>
//   );
// };

// export default WeeklyEvents;

"use client";

import { FC } from "react";
import Image from "next/image";
import { PromoBanner } from "@prisma/client";

import useCursorStore from "@/hooks/useCursorStore";
import SectionComponent from "@/components/global/SectionComponent";
import Heading from "@/components/global/Heading";
import { BookTableButton } from "@/components/global/BookTableButton";
import { cn } from "@/lib/utils";

interface WeeklyEventsProps {
  promos: PromoBanner[];
}

const getCardHeight = (index: number) => {
  if (index === 0) return "h-[350px]";
  if (index === 1) return "h-[500px] max-md:h-[350px]";
  if (index === 2) return "h-[400px] max-md:h-[350px] md:place-self-end";
  if (index === 3) return "h-[400px] max-md:h-[350px]";

  return "h-[350px]";
};

const WeeklyEvents: FC<WeeklyEventsProps> = ({ promos }) => {
  const setCursor = useCursorStore((s) => s.setCursor);

  if (!promos || promos.length === 0) return null;

  const onPointerEnter = (index: number) => {
    const promo = promos[index];
    if (!promo) return;

    setCursor({
      label: (
        <div className="flex flex-col items-center justify-center space-y-1 p-1">
          <p className="text-center">{promo.title}</p>
          <p className="text-center text-sm text-wrap">{promo.message}</p>
        </div>
      ),
      type: "weekly",
    });
  };

  const onPointerLeave = () => {
    setCursor({ label: null, type: "default" });
  };

  return (
    <SectionComponent className="max-md:mb-20">
      <Heading label="Weekly Lineups" />

      <div
        className={cn(
          "relative grid gap-6 md:gap-8",
          promos.length === 1 && "grid-cols-1",
          promos.length === 2 && "grid-cols-1 md:grid-cols-2",
          promos.length === 3 && "grid-cols-1 md:grid-cols-3",
          promos.length >= 4 && "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
        )}>
        {promos.map((promo, index) => (
          <div
            key={promo.id}
            onPointerEnter={() => onPointerEnter(index)}
            onPointerLeave={onPointerLeave}
            className={cn(
              "relative w-full overflow-hidden rounded-sm",
              getCardHeight(index),
            )}>
            <div className="absolute inset-0 z-30 flex items-center justify-center md:hidden">
              <div className="flex size-44 items-center justify-center rounded-sm bg-primary/80 p-3 text-white backdrop-blur-[2px]">
                <div className="flex flex-col items-center justify-center space-y-1">
                  <p className="text-center">{promo.title}</p>
                  <p className="text-center text-sm text-wrap">
                    {promo.message}
                  </p>
                </div>
              </div>
            </div>

            <Image
              src={promo.imageUrl ?? "/placeholder.jpg"}
              alt={promo.title ?? "Event image"}
              fill
              className="object-cover"
            />
          </div>
        ))}

        <div className="absolute -bottom-12 md:right-0">
          <BookTableButton
            type="EVENT"
            trigger={
              <div className="group z-40 flex cursor-pointer items-center gap-2 md:p-2 md:pl-0">
                <div className="relative inline-block h-4 w-40 shrink-0 translate-x-0 transition-transform duration-300 group-hover:-translate-x-2 sm:w-[200px]">
                  <Image
                    src="/Arrow.svg"
                    alt="Arrow"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex h-4 translate-x-0 items-center justify-center transition-transform duration-300 group-hover:translate-x-2">
                  Group Booking
                </div>
              </div>
            }
          />
        </div>
      </div>
    </SectionComponent>
  );
};

export default WeeklyEvents;
