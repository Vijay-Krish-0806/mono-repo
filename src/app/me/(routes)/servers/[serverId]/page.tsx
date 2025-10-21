import { getSession } from "../../../../../../lib/auth-utils";
import { redirect } from "next/navigation";
import db from "../../../../../../db/drizzle";
interface ServerIdPageProps {
  params: {
    serverId: string;
  };
}
const ServerIdPage = async ({ params }: ServerIdPageProps) => {
  const profile = await getSession();
  const { serverId } = await params;
  if (!profile) {
    return redirect("/auth/sign-in");
  }

  const server = await db.query.servers
    .findFirst({
      where: (servers, { eq }) => eq(servers.id, serverId),
      with: {
        channels: {
          where: (channels, { eq }) => eq(channels.name, "general"),
          orderBy: (channels, { asc }) => [asc(channels.createdAt)],
        },
        members: {
          where: (members, { eq }) => eq(members.userId, profile.id),
        },
      },
    })
    .then((server) => (server && server.members.length > 0 ? server : null));
  const initialChannel = server?.channels[0];
  if (initialChannel?.name !== "general") return null;

  return redirect(`/me/servers/${serverId}/channels/${initialChannel?.id}`);
};

export default ServerIdPage;
