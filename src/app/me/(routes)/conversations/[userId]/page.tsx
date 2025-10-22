import { redirect } from "next/navigation";

import { ChatHeader } from "@/app/components/chat/chat-header";
import { ChatMessages } from "@/app/components/chat/chat-messages";
import { ChatInput } from "@/app/components/chat/chat-input";
import { getSession } from "../../../../../../lib/auth-utils";
import db from "../../../../../../db/drizzle";
import { getOrCreateConversation } from "../../../../../../db/queries";
import { MediaRoom } from "@/app/components/media-room";

interface DirectConversationPageProps {
  params: {
    userId: string;
  };
  searchParams: {
    video?: boolean;
  };
}

export default async function DirectConversationPage({
  params,
  searchParams,
}: DirectConversationPageProps) {
  const profile = await getSession();
  searchParams = await searchParams;

  if (!profile) {
    return redirect("/auth/sign-in");
  }

  const { userId } = await params;

  // Get the other user's details
  const otherUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (!otherUser) {
    return redirect("/me");
  }

  // Get current user's member ID (from any server they're in)
  const currentUserMember = await db.query.members.findFirst({
    where: (members, { eq }) => eq(members.userId, profile.id),
    with: {
      user: true,
    },
  });

  // Get other user's member ID
  const otherUserMember = await db.query.members.findFirst({
    where: (members, { eq }) => eq(members.userId, userId),
    with: {
      user: true,
    },
  });

  if (!currentUserMember || !otherUserMember) {
    return redirect("/me");
  }

  // Use your existing function to get or create conversation
  const conversation = await getOrCreateConversation(
    currentUserMember.id,
    otherUserMember.id
  );

  if (!conversation) {
    return redirect("/me");
  }

  const { memberOne, memberTwo } = conversation;
  const otherMember = memberOne.userId === profile.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember.user.imageUrl || ""}
        name={otherMember.user.name!}
        serverId=""
        type="conversation"
      />
      {searchParams.video && (
        <MediaRoom
          chatId={conversation.id}
          video={true}
          audio={true}
          profileName={profile.name}
        />
      )}

      {!searchParams.video && (
        <>
          <ChatMessages
            member={currentUserMember}
            name={otherMember.user.name!}
            chatId={conversation.id}
            type="conversation"
            apiUrl={`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/direct-messages`}
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl={
              `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/direct-messages` ||
              "http://localhost:4000/api/direct-messages"
            }
            socketQuery={{
              conversationId: conversation.id,
              profileId: profile.id,
            }}
          />
          <ChatInput
            name={otherMember.user.name!}
            type="conversation"
            apiUrl={
              `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/direct-messages` ||
              "http://localhost:4000/api/direct-messages"
            }
            query={{
              conversationId: conversation.id,
              profileId: profile.id,
            }}
          />
        </>
      )}
    </div>
  );
}
