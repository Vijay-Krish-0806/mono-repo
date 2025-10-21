import { v4 as uuidv4 } from "uuid";

import { NextResponse } from "next/server";
import { getSession } from "../../../../../../lib/auth-utils";
import db from "../../../../../../db/drizzle";
import { servers } from "../../../../../../db/schema";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  re: Request,
  { params }: { params: { serverId: string } }
) {
  params = await params;
  try {
    const profile = await getSession();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server id Missing", { status: 400 });
    }

    const [server] = await db
      .update(servers)
      .set({
        inviteCode: uuidv4(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(servers.id, params.serverId), eq(servers.userId, profile.id))
      )
      .returning();

    return NextResponse.json(server);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
