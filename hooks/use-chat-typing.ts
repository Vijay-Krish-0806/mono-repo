// import { useSocket } from "@/app/components/providers/SocketContext";
// import { useEffect, useState } from "react";

// type TypingUser = {
//   userId: string;
//   username: string;
//   roomId: string;
// };

// type UseTypingIndicatorProps = {
//   roomId: string;
// };

// export const useTypingIndicator = ({ roomId }: UseTypingIndicatorProps) => {
//   const { socket } = useSocket();
//   const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
//   const typingTimeoutRef: { current: NodeJS.Timeout | null } = {
//     current: null,
//   };

//   // Listen for typing events
//   useEffect(() => {
//     if (!socket) return;

//     socket.on("typing", (data: TypingUser) => {
//       console.log(` ${data.username} is typing...`);

//       setTypingUsers((prev) => {
//         // Check if user is already in the list
//         const userExists = prev.some((user) => user.userId === data.userId);
//         if (userExists) {
//           return prev;
//         }
//         return [...prev, data];
//       });

//       // Remove user after 3 seconds of inactivity
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }

//       typingTimeoutRef.current = setTimeout(() => {
//         setTypingUsers((prev) =>
//           prev.filter((user) => user.userId !== data.userId)
//         );
//       }, 3000);
//     });

//     return () => {
//       socket.off("typing");
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//     };
//   }, [socket]);

//   // Emit typing event when user is typing
//   const emitTyping = () => {
//     if (socket) {
//       socket.emit("startTyping", roomId);
//     }
//   };
//   console.log(typingUsers);

//   return {
//     typingUsers,
//     emitTyping,
//   };
// };

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
      console.log(`${data.username} is typing...`);

      // Add user to typing list if not already there
      setTypingUsers((prev) => {
        const userExists = prev.some((user) => user.userId === data.userId);
        if (userExists) {
          return prev;
        }
        return [...prev, data];
      });

      // Clear existing timeout for this specific user
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

      // Clear all timeouts on cleanup
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
