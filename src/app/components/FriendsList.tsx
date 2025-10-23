"use client";

import { useSocket } from "./providers/SocketContext";
import UserAvatar from "./user-avatar";
import { Users } from "lucide-react";
import { useFriends } from "../../../hooks/use-friends-invite";
import ActionTooltip from "./action-tooltip";

interface FriendsListProps {
  userId: string | null;
}

export function FriendsList({ userId }: FriendsListProps) {
  const { socket, presenceMap } = useSocket();
  const { friends, openConversation } = useFriends(socket, userId);

  return (
    <div className="w-full">
      <div className="p-4">
        <div className="flex items-center">
          <ActionTooltip label="Friends">
            <Users className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </ActionTooltip>
        </div>
      </div>

      {friends.length === 0 ? (
        <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No friends yet
        </div>
      ) : (
        <div className="">
          {friends.map((friend) => {
            const presence = presenceMap[friend.id];
            const isOnline = presence?.isOnline || false;

            return (
              <div
                key={friend.id}
                onClick={() => openConversation(friend.id)}
                className="mb-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer flex flex-col items-center"
              >
                <div className="relative">
                  <UserAvatar
                    src={friend.imageUrl}
                    name={friend.name}
                    className="w-6 h-6"
                  />
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-800 rounded-full" />
                  )}
                </div>
                <p className="mt-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[100px]">
                  {friend.name}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
