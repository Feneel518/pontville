import CheckoutComponent from "@/components/frontend/cart/CheckoutComponent";
import ArrowButton from "@/components/ui/ArrowButton";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import Image from "next/image";
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
    <section className="relative grid min-h-svh md:grid-cols-2 -mt-16 md:-mt-20">
      {/* Left: Main image */}
      <div className="relative min-h-svh w-full md:min-h-full max-md:hidden">
        <Image
          src="/mainImage.jpg"
          alt="Hero Image"
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {/* Right: Side image + button (desktop only) */}
      <div className="relative  w-full p-6  md:p-20">
        <CheckoutComponent user={session.user}></CheckoutComponent>
      </div>

      {/* Overlay: Title content */}
    </section>
    // <div>
    //   <CheckoutComponent user={session.user}></CheckoutComponent>
    // </div>
  );
};

export default page;
