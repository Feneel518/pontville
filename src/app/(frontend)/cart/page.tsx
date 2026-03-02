import CartPage from "@/components/dashboard/cart/CartPage";
import SectionComponent from "@/components/global/SectionComponent";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <SectionComponent>
      <CartPage></CartPage>
    </SectionComponent>
  );
};

export default page;
