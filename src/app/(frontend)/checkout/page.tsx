import CheckoutComponent from "@/components/frontend/cart/CheckoutComponent";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login?next=/checkout");
  }
  return (
    <div>
      <CheckoutComponent user={session.user}></CheckoutComponent>
    </div>
  );
};

export default page;
