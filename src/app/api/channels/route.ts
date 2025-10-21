import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth-utils";
import db from "../../../../db/drizzle";
import { channels } from "../../../../db/schema";

import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const { name, type } = await req.json();

    const serverId = searchParams.get("serverId");

    const profile = await getSession();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!serverId) {
      return new NextResponse("ServerId missing ", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    const hasPermission = await db.query.members.findFirst({
      where: (members, { eq, and, inArray }) =>
        and(
          eq(members.serverId, serverId),
          eq(members.userId, profile.id),
          inArray(members.role, ["ADMIN", "MODERATOR"])
        ),
    });

    if (!hasPermission) {
      throw new Error("Insufficient permissions");
    }

    // Create the channel
    const [channel] = await db
      .insert(channels)
      .values({
        id: uuidv4(),
        name,
        type,
        userId: profile.id,
        serverId: serverId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const server = await db.query.servers.findFirst({
      where: (servers, { eq }) => eq(servers.id, serverId),
      with: {
        channels: {
          orderBy: (channels, { asc }) => [asc(channels.createdAt)],
        },
        members: {
          with: {
            user: true,
          },
          orderBy: (members, { asc }) => [asc(members.role)],
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[CHANNEL_CREATE_POST]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
