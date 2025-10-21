import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "../../../../../../lib/auth-utils";
import db from "../../../../../../db/drizzle";
import { and, eq } from "drizzle-orm";
import { members, servers } from "../../../../../../db/schema";

interface InviteCodePageProps {
  params: { inviteCode: string };
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
  try {
    const profile = await getSession();
    const { inviteCode } = await params;

    if (!profile) {
      return redirect("/auth/sign-in");
    }
    if (!inviteCode) {
      return redirect("/me");
    }

    // First, find the server by invite code
    const server = await db.query.servers.findFirst({
      where: (servers, { eq }) => eq(servers.inviteCode, inviteCode),
    });

    if (!server) {
      throw new Error("Server not found");
    }

    // Check if user is already a member of this server
    const existingMember = await db.query.members.findFirst({
      where: (members, { eq, and }) =>
        and(eq(members.serverId, server.id), eq(members.userId, profile.id)),
    });

    // If user is already a member, redirect to the server
    if (existingMember) {
      return redirect(`/me/servers/${server.id}`);
    }

    // If not a member, create new member
    await db.insert(members).values({
      id: uuidv4(),
      userId: profile.id,
      serverId: server.id,
      role: "GUEST",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Redirect to the server after successful join
    return redirect(`/me/servers/${server.id}`);
  } catch (error) {
    console.error("Error in invite code page:", error);
    return redirect("/me");
  }
  
};

export default InviteCodePage;
