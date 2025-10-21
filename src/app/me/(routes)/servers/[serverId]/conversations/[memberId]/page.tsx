import { redirect } from "next/navigation";
import { getSession } from "../../../../../../../../lib/auth-utils";
import db from "../../../../../../../../db/drizzle";
import { getOrCreateConversation } from "../../../../../../../../db/queries";
import { ChatHeader } from "@/app/components/chat/chat-header";
import { ChatMessages } from "@/app/components/chat/chat-messages";
import { ChatInput } from "@/app/components/chat/chat-input";
import { MediaRoom } from "@/app/components/media-room";

interface MemberIdPageProps {
  params: {
    memberId: string;
    serverId: string;
  };
  searchParams: {
    video?: boolean;
  };
}

export default async function ConversationPage({
  params,
  searchParams,
}: MemberIdPageProps) {
  const profile = await getSession();
  searchParams = await searchParams;
  if (!profile) {
    return redirect("/auth/sign");
  }

  const { memberId, serverId } = await params;
  const currentMember = await db.query.members.findFirst({
    where: (members, { eq, and }) =>
      and(eq(members.serverId, serverId), eq(members.userId, profile.id)),
    with: {
      user: true,
    },
  });

  if (!currentMember) {
    return redirect("/me");
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberId
  );

  if (!conversation) {
    return redirect(`/me/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember = memberOne.userId === profile.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full ">
      <ChatHeader
        imageUrl={otherMember.user.imageUrl || ""}
        name={otherMember.user.name!}
        serverId={serverId}
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
            member={currentMember}
            name={otherMember.user.name!}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl={
              `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/direct-messages` ||
              `http//:localhost:4000/api/direct-messages`
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
              `http//:localhost:4000/api/direct-messages`
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
