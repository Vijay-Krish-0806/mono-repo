import { NextResponse } from "next/server";
import { getSession } from "../../../../../../lib/auth-utils";
import { eq, and, not, exists } from "drizzle-orm";
import db from "../../../../../../db/drizzle";
import { members, servers } from "../../../../../../db/schema";

export async function PATCH(req: Request, { params }: { params: { serverId: string } }) {
    try {
        const profile = await getSession();
        const {serverId}=await params;
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!serverId) {
            return new NextResponse("Server ID is required", { status: 400 });
        }
        const server = await db.query.servers.findFirst({
            where: (servers, { eq, and, ne, exists }) =>
                and(
                    eq(servers.id, serverId),
                    ne(servers.userId, profile.id),
                    exists(
                        db.select()
                            .from(members)
                            .where(
                                and(
                                    eq(members.serverId, servers.id),
                                    eq(members.userId, profile.id)
                                )
                            )
                    )
                )
        });

        if (!server) {
            throw new Error("Server not found or you are the owner");
        }

        await db.delete(members)
            .where(
                and(
                    eq(members.serverId, serverId),
                    eq(members.userId, profile.id)
                )
            );

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_ID_LEAVE]", error);

        // Handle specific error cases
        if (error instanceof Error && error.message === "Server not found or conditions not met") {
            return new NextResponse("Server not found or you are not a member", { status: 404 });
        }

        return new NextResponse("Internal Error", { status: 500 });
    }
}