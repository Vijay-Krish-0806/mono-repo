import React from "react";
import InitialModal from "../components/modals/initial-modal";
import { getSession } from "../../../lib/auth-utils";

import { getServer } from "../../../db/queries";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await getSession();

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const server = await getServer(user.id);

  if (server) {
    return redirect(`/me/servers/${server.id}`);
  }
  return <InitialModal />;
};

export default Page;
