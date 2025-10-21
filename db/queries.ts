import { eq, and, sql } from "drizzle-orm";
import db from "./drizzle";
import { conversations, members, servers } from "./schema";

export const getServer = async (id: string) => {
  const server = await db
    .select({
      id: servers.id,
      name: servers.name,
      imageUrl: servers.imageUrl,
      inviteCode: servers.inviteCode,
      userId: servers.userId,
    })
    .from(servers)
    .innerJoin(members, eq(members.serverId, servers.id))
    .where(eq(members.userId, id))
    .limit(1);

  return server[0];
};

const findConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    return await db.query.conversations.findFirst({
      where: (conversations, { eq, and }) =>
        and(
          eq(conversations.memberOneId, memberOneId),
          eq(conversations.memberTwoId, memberTwoId)
        ),
      with: {
        memberOne: {
          with: {
            user: true,
          },
        },
        memberTwo: {
          with: {
            user: true,
          },
        },
      },
    });
  } catch {
    return null;
  }
};

const createNewConversation = async (
  memberOneId: string,
  memberTwoId: string
) => {
  try {
    const [conversation] = await db
      .insert(conversations)
      .values({
        memberOneId,
        memberTwoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return await db.query.conversations.findFirst({
      where: (conversations, { eq }) => eq(conversations.id, conversation.id),
      with: {
        memberOne: {
          with: {
            user: true,
          },
        },
        memberTwo: {
          with: {
            user: true,
          },
        },
      },
    });
  } catch {
    return null;
  }
};

export const getOrCreateConversation = async (
  memberOneId: string,
  memberTwoId: string
) => {
  let conversation =
    (await findConversation(memberOneId, memberTwoId)) ||
    (await findConversation(memberTwoId, memberOneId));

  if (!conversation) {
    await createNewConversation(memberOneId, memberTwoId);
  }
  return conversation;
};
