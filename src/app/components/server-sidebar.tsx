import { redirect } from "next/navigation";
import { getSession } from "../../../lib/auth-utils";
import db from "../../../db/drizzle";
import { ServerHeader } from "./server-header";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@/components/ui/separator";
import { ServerSection } from "./server-section";
import ServerChannel from "./server-channel";
import { ServerMember } from "./server-member";
import { SearchServer } from "./server-search";
import { channelTypeEnum, memberRoleEnum } from "../../../db/schema";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

interface ServerSidebarProps {
  serverId: string;
}
const iconMap = {
  [channelTypeEnum.enumValues[0]]: <Hash className="mr-2 h-4 w-4" />,
  [channelTypeEnum.enumValues[1]]: <Mic className="mr-2 h-4 w-4" />,
  [channelTypeEnum.enumValues[2]]: <Video className="mr-2 h-4 w-4" />,
};
const roleIconMap = {
  [memberRoleEnum.enumValues[2]]: null,
  [memberRoleEnum.enumValues[1]]: (
    <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />
  ),
  [memberRoleEnum.enumValues[0]]: (
    <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />
  ),
};
export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await getSession();
  if (!profile) {
    return redirect("/auth/sign-in");
  }
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

  const textChannels = server?.channels.filter(
    (channel) => channel.type === "TEXT"
  );
  const audioChannels = server?.channels.filter(
    (channel) => channel.type === "AUDIO"
  );
  const videoChannels = server?.channels.filter(
    (channel) => channel.type === "VIDEO"
  );

  const members = server?.members.filter(
    (member) => member.userId !== profile.id
  );

  if (!server) {
    return redirect("/me");
  }

  const role = server.members.find(
    (member) => member.userId === profile.id
  )?.role;

  return (
    <div className="flex flex-col h-full mt-16 text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5] pl-18 md:pl-0!">
      <ServerHeader server={server} role={role} />

      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <SearchServer
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  id: member.id,
                  name: member.user.name!,
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>

        <Separator className="bg-zinc dark:bg-zinc-700 rounded-md my-2" />

        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={channelTypeEnum.enumValues[0]}
              label="Text Channels"
              role={role}
            />
            <div className="space-y-[2px]">
              {textChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}

        {!!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={channelTypeEnum.enumValues[1]}
              label="Voice Channels"
              role={role}
            />
            <div className="space-y-[2px]">
              {audioChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}

        {!!videoChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={channelTypeEnum.enumValues[2]}
              label="Video Channels"
              role={role}
            />
            <div className="space-y-[2px]">
              {videoChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}

        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              label="Members"
              role={role}
              server={server}
            />
            <div className="space-y-[2px]">
              {members.map((member) => (
                <ServerMember key={member.id} member={member} server={server} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
