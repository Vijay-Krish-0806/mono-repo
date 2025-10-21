import db from "../../../../../db/drizzle";
import { getSession } from "../../../../../lib/auth-utils";

export async function GET(req: Request) {
  const session = await getSession();

  if (!session?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the user's current server member ID (or any member ID)
  const member = await db.query.members.findFirst({
    where: (members, { eq }) => eq(members.userId, session.id),
  });

  if (!member) {
    return Response.json({ error: "Member not found" }, { status: 404 });
  }

  return Response.json({ memberId: member.id });
}
