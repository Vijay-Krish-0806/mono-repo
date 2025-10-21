import { NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth-utils";
import db from "../../../../../db/drizzle";
import { members } from "../../../../../db/schema";
import { and, eq, ne } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const { memberId } = await params;

    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    const profile = await getSession();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!serverId) {
      return new NextResponse("ServerId missing ", { status: 400 });
    }
    if (!memberId) {
      return new NextResponse("MemberID  missing ", { status: 400 });
    }

    await db.delete(members).where(
      and(
        eq(members.id, memberId),
        eq(members.serverId, serverId),
        ne(members.userId, profile.id)
      )
    );

    const server = await db.query.servers.findFirst({
      where: (servers, { eq }) => eq(servers.id, serverId),
      with: {
        members: {
          with: {
            user: true,
          },
          orderBy: (members, { asc }) => [asc(members.role)],
        },
        channels: true,
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[MEMBERS_ID_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const { memberId } = await params;

    const { searchParams } = new URL(req.url);
    const { role } = await req.json();

    const serverId = searchParams.get("serverId");

    const profile = await getSession();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!serverId) {
      return new NextResponse("ServerId missing ", { status: 400 });
    }
    if (!memberId) {
      return new NextResponse("MemberID  missing ", { status: 400 });
    }

    await db
      .update(members)
      .set({
        role: role,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(members.id, memberId),
          eq(members.serverId, serverId),
          ne(members.userId, profile.id)
        )
      );

    const server = await db.query.servers.findFirst({
      where: (servers, { eq }) => eq(servers.id, serverId),
      with: {
        members: {
          with: {
            user: true,
          },
          orderBy: (members, { asc }) => [asc(members.role)],
        },
        channels: true,
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[MEMBERS_ID_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

