import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth-utils";
import { Message } from "../../../../db/schema";
import db from "../../../../db/drizzle";

const MESSAGES_BATCH = 10;
export async function GET(req: Request) {
  try {
    const profile = await getSession();
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!channelId) {
      return new NextResponse("ChannelId missing", { status: 400 });
    }

    let messages: Message[] = [];

    if (cursor) {
      messages = await db.query.messages.findMany({
        where: (messages, { eq, and, lt }) =>
          and(
            eq(messages.channelId, channelId),
            cursor ? lt(messages.id, cursor) : undefined
          ),
        limit: MESSAGES_BATCH,
        with: {
          member: {
            with: {
              user: true,
            },
          },
        },
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
      });
    } else {
      messages = await db.query.messages.findMany({
        where: (messages, { eq }) => eq(messages.channelId, channelId),
        limit: MESSAGES_BATCH,
        with: {
          member: {
            with: {
              user: true,
            },
          },
        },
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
      });
    }

    let nextCursor = null;
    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    return NextResponse.json({ items: messages, nextCursor });
  } catch (error) {
    console.error("[Messages error]", error);
    return new NextResponse("Internal Server error", { status: 500 });
  }
}
