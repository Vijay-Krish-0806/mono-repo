import { NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth-utils";
import db from "../../../../../db/drizzle";
import { servers } from "../../../../../db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = await params;
    const profile = await getSession();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const server = await db
      .delete(servers)
      .where(
        and(eq(servers.id, serverId), eq(servers.userId, profile.id))
      )
      .returning();

    return NextResponse.json(server);
  } catch (error) {
    console.error("[SERVER_ID_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = await params;

    const { name, imageUrl } = await req.json();
    const profile = await getSession();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [server] = await db
      .update(servers)
      .set({
        name,
        imageUrl,
        updatedAt: new Date(),
      })
      .where(and(eq(servers.id, serverId), eq(servers.userId, profile.id)))
      .returning();

    return NextResponse.json(server);
  } catch (error) {
    console.error("[SERVER_ID_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
