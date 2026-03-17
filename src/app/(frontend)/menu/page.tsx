import MenuHeader from "@/components/frontend/Menu/MenuHeader";
import { pageMetadata } from "@/lib/helpers/seo";
import { Metadata } from "next";
import { FC } from "react";

interface pageProps {}

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Menu",
  description:
    "Browse The Pontville Pub menu — classic pub favourites, drinks, and seasonal specials in Pontville, Tasmania.",
  path: "/menu",
});

const page: FC<pageProps> = ({}) => {
  return (
    <div>
      <MenuHeader></MenuHeader>
    </div>
  );
};

export default page;
