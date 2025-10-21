import { NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth-utils";
import db from "../../../../../db/drizzle";
import { channels } from "../../../../../db/schema";
import { and, eq, ne } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const { channelId } = await params;
    const profile = await getSession();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!channelId) {
      return new NextResponse("Channel id missssing", { status: 400 });
    }
    if (!serverId) {
      return new NextResponse("Server id missssing", { status: 400 });
    }
    const canDelete = await db.query.channels.findFirst({
      where: (channels, { eq, and, ne }) =>
        and(
          eq(channels.id, channelId),
          eq(channels.serverId, serverId),
          ne(channels.name, "general")
        ),
      with: {
        server: {
          with: {
            members: {
              where: (members, { eq, and, inArray }) =>
                and(
                  eq(members.userId, profile.id),
                  inArray(members.role, ["ADMIN", "MODERATOR"])
                ),
            },
          },
        },
      },
    });

    if (!canDelete || canDelete.server.members.length === 0) {
      throw new Error("Channel not found or insufficient permissions");
    }

    // Delete the channel
    await db
      .delete(channels)
      .where(
        and(
          eq(channels.id, channelId),
          eq(channels.serverId, serverId),
          ne(channels.name, "general")
        )
      );

    // Get the updated server
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
    console.error("[Channel id delete]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const { channelId } = await params;
    const profile = await getSession();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!channelId) {
      return new NextResponse("Channel id missssing", { status: 400 });
    }
    if (!serverId) {
      return new NextResponse("Server id missssing", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("Name cannot be general", { status: 400 });
    }

    // First, check if user has permission (ADMIN or MODERATOR)
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

    await db
      .update(channels)
      .set({
        name,
        type,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(channels.id, channelId),
          eq(channels.serverId, serverId),
          ne(channels.name, "general") // Cannot update "general" channel
        )
      );

    // Get the updated server with channels and members
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
    console.error("[Channel id delete]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
