import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "../../../../db/drizzle";
import { channels, members, servers } from "../../../../db/schema";
import { getSession } from "../../../../lib/auth-utils";
export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();

    const user = await getSession();

    if (!name || !user) {
      return new NextResponse("Name and user ID are required", { status: 400 });
    }

    let userId = user.id;
    const serverId = uuidv4();
    const channelId = uuidv4();
    const memberId = uuidv4();
    const inviteCode = uuidv4();

    // Insert server
    await db.insert(servers).values({
      id: serverId,
      name,
      imageUrl,
      inviteCode,
      userId,
    });

    // Insert channel
    await db.insert(channels).values({
      id: channelId,
      name: "general",
      type: "TEXT",
      userId,
      serverId: serverId,
    });

    // Insert member
    await db.insert(members).values({
      id: memberId,
      role: "ADMIN",
      userId,
      serverId: serverId,
    });

    // Query the complete server
    const server = await db.query.servers.findFirst({
      where: (servers, { eq }) => eq(servers.id, serverId),
      with: {
        channels: true,
        members: true,
      },
    });

    return NextResponse.json(server, { status: 201 });
  } catch (error) {
    console.error("[SERVERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

