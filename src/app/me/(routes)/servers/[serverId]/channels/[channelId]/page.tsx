import { redirect } from "next/navigation";
import { getSession } from "../../../../../../../../lib/auth-utils";
import db from "../../../../../../../../db/drizzle";
import { ChatHeader } from "@/app/components/chat/chat-header";
import { ChatInput } from "@/app/components/chat/chat-input";
import { ChatMessages } from "@/app/components/chat/chat-messages";
import { MediaRoom } from "@/app/components/media-room";

interface ChannelIdPageProps {
  params: {
    serverId: string;
    channelId: string;
  };
}
export default async function ChannelIdPage({ params }: ChannelIdPageProps) {
  const profile = await getSession();
  const { serverId, channelId } = await params;
  if (!profile) {
    return redirect("/auth/sign-in");
  }
  const channel = await db.query.channels.findFirst({
    where: (channels, { eq }) => eq(channels.id, channelId),
  });
  const member = await db.query.members.findFirst({
    where: (members, { eq, and }) =>
      and(eq(members.serverId, serverId), eq(members.userId, profile.id)),
    with: {
      user: true,
    },
  });
  if (!channel || !member) return redirect("/me");

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full relative">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      <div className="flex-1" />
      {channel.type === "TEXT" && (
        <>
          <ChatMessages
            member={member}
            name={channel.name}
            type="channel"
            apiUrl={`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/messages`}
            chatId={channel.id}
            socketQuery={{
              channelId: channel.id,
              serverId: channel.serverId,
              profileId: profile.id,
            }}
            paramKey="channelId"
            paramValue={channel.id}
          />
          <ChatInput
            name={channel.name}
            type="channel"
            apiUrl={
              `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/messages` ||
              "http://localhost:4000/api/messages"
            }
            query={{
              channelId: channel.id,
              serverId: channel.serverId,
              profileId: profile.id,
            }}
          />
        </>
      )}

      {channel.type === "AUDIO" && (
        <MediaRoom
          chatId={channel.id}
          video={false}
          audio={true}
          profileName={profile.name}
        />
      )}
      {channel.type === "VIDEO" && (
        <MediaRoom
          chatId={channel.id}
          video={true}
          audio={true}
          profileName={profile.name}
        />
      )}
    </div>
  );
}
