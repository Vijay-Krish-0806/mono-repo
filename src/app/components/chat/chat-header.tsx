import { Hash } from "lucide-react";
import { MobileToggle } from "../mobile-toggle";
import { SocketIndicator } from "../socket-indicator";
import { ChatVideoButton } from "../chat-video-button";
import UserAvatar from "../user-avatar";

interface ChatHeaderProps {
  serverId: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string;
}
export const ChatHeader = ({
  serverId,
  name,
  type,
  imageUrl,
}: ChatHeaderProps) => {
  return (
    <div className="text-md font-semibold px-3 bg-zinc-100 dark:bg-zinc-900 flex items-center h-12  sticky top-15 z-40">
      <MobileToggle serverId={serverId} />
      {type === "channel" && (
        <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
      )}
      <UserAvatar src={imageUrl} name={name} className="border-white" />
      <p className="ml-2 font-semibold text-md text-black dark:text-white">
        {name}
      </p>
      <div className="ml-auto flex items-center">
        {type === "conversation" && <ChatVideoButton />}
        <SocketIndicator />
      </div>
    </div>
  );
};
