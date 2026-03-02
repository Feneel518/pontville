import { headers } from "next/headers";
import { auth } from "../auth/auth";
import { redirect } from "next/navigation";

export const requireUser = async (next?: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(`/auth/login?next=${next}`);
  }

  return {user:session.user}
};
