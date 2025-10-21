
import { auth } from "./auth";
import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  const session = await auth.api.getSession({
    headers: {
      cookie: cookieStore.toString(),
    },
  });

  return session?.user;
}
