import React from "react";
import { getSession } from "../../../../../../lib/auth-utils";
import { redirect } from "next/navigation";
import db from "../../../../../../db/drizzle";
import { ServerSidebar } from "@/app/components/server-sidebar";

const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { serverId: string };
}) => {
  const profile = await getSession();
  const { serverId } = await params;
  if (!profile) {
    return redirect("/auth/sign-in");
  }

  const server = await db.query.servers.findFirst({
    where: (servers, { eq }) => eq(servers.id, serverId),
    with: {
      members: {
        where: (members, { eq }) => eq(members.userId, profile.id),
      },
    },
  });

  if (!server) {
    return redirect("/me");
  }
  return (
    <div className="h-full">
      <div className="hidden md:flex! h-full w-60 z-20 flex-col fixed inset-y-0 ">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
};

export default ServerIdLayout;
