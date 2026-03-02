import SigninForm from "@/components/auth/signin-form";
import { FC } from "react";

interface pageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const { next } = await searchParams;
  return <SigninForm next={next}></SigninForm>;
};

export default page;
