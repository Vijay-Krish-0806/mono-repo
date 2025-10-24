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
    <div className="text-md font-semibold px-3 bg-white dark:bg-zinc-900 flex items-center h-16 border-b border-zinc-200 dark:border-zinc-800 sticky top-15 z-10 shadow-sm">
      <MobileToggle serverId={serverId} />

      {type === "channel" ? (
        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center mr-3">
          <Hash className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </div>
      ) : (
        <UserAvatar
          src={imageUrl}
          name={name}
          className="w-10 h-10 mr-3 border-2 border-white dark:border-zinc-900"
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-base text-zinc-900 dark:text-white truncate">
          {name}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {type === "conversation" && <ChatVideoButton />}
        <SocketIndicator />
      </div>
    </div>
  );
};
