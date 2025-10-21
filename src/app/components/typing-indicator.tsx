"use client";

import { useTypingIndicator } from "../../../hooks/use-chat-typing";

interface TypingIndicatorProps {
  roomId: string;
}

export const TypingIndicator = ({ roomId }: TypingIndicatorProps) => {
  const { typingUsers } = useTypingIndicator({ roomId });

  if (typingUsers.length === 0) {
    return null;
  }

  const displayText =
    typingUsers.length === 1
      ? `${typingUsers[0].username} is typing...`
      : `${typingUsers.map((u) => u.username).join(", ")} are typing...`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce" />
        <div
          className="w-2 h-2 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        />
        <div
          className="w-2 h-2 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
      <span>{displayText}</span>
    </div>
  );
};
