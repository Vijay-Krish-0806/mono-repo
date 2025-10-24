import { useSocket } from "@/app/components/providers/SocketContext";
import { useEffect, useState, useRef } from "react";

type TypingUser = {
  userId: string;
  username: string;
  roomId: string;
};

type UseTypingIndicatorProps = {
  roomId: string;
};

export const useTypingIndicator = ({ roomId }: UseTypingIndicatorProps) => {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // ✅ Store a timeout for EACH user
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Listen for typing events
  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data: TypingUser) => {
      setTypingUsers((prev) => {
        const userExists = prev.some((user) => user.userId === data.userId);
        if (userExists) {
          return prev;
        }
        return [...prev, data];
      });

      const existingTimeout = typingTimeoutsRef.current.get(data.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout for this specific user
      const timeout = setTimeout(() => {
        setTypingUsers((prev) =>
          prev.filter((user) => user.userId !== data.userId)
        );
        typingTimeoutsRef.current.delete(data.userId);
      }, 3000);

      typingTimeoutsRef.current.set(data.userId, timeout);
    };

    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing", handleTyping);
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
    };
  }, [socket]);

  // Emit typing event when user is typing
  const emitTyping = () => {
    if (socket && socket.connected) {
      socket.emit("startTyping", roomId);
    }
  };

  return {
    typingUsers,
    emitTyping,
  };
};
