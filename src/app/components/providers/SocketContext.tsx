// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";
// import type { ServerToClientEvents, ClientToServerEvents } from "shared";
// import { useSession } from "../../../../lib/auth-client";

// type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

// interface SocketContextType {
//   socket: SocketType | null;
//   isConnected: boolean;
// }

// const SocketContext = createContext<SocketContextType>({
//   socket: null,
//   isConnected: false,
// });

// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error("useSocket must be used within SocketProvider");
//   }
//   return context;
// };

// export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//   const session = useSession();
//   console.log("Session", session);

//   const [socket, setSocket] = useState<SocketType | null>(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     if (!session.data) {
//       console.log("inside socket context");
//       return ;
//     }

//     const socketUrl =
//       process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

//     console.log(" Attempting to connect to:", socketUrl);

//     const socketInstance: SocketType = io(socketUrl, {
//       withCredentials: true,
//       autoConnect: true,
//       addTrailingSlash: false,
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       reconnectionAttempts: 5,
//     });

//     socketInstance.on("connect", () => {
//       console.log("✅ Connected to Socket.IO server");
//       setIsConnected(true);
//     });

//     socketInstance.on("disconnect", (reason) => {
//       console.log("❌ Disconnected from Socket.IO server. Reason:", reason);
//       setIsConnected(false);
//     });

//     socketInstance.on("connect_error", (error) => {
//       console.error("❌ Socket connection error:", error);
//     });

//     setSocket(socketInstance);

//     return () => {
//       console.log("🧹 Cleaning up socket connection");
//       socketInstance.disconnect();
//     };
//   }, [session,session.data]);

//   return (
//     <SocketContext.Provider value={{ socket, isConnected }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";
// import type { ServerToClientEvents, ClientToServerEvents } from "shared";
// import { useSession } from "../../../../lib/auth-client";

// type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

// interface SocketContextType {
//   socket: SocketType | null;
//   isConnected: boolean;
// }

// const SocketContext = createContext<SocketContextType>({
//   socket: null,
//   isConnected: false,
// });

// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error("useSocket must be used within SocketProvider");
//   }
//   return context;
// };

// export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//   const session = useSession();
//   const [socket, setSocket] = useState<SocketType | null>(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     if (!session.data?.user?.id) {
//       return;
//     }

//     const socketUrl =
//       process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

//     console.log("Attempting to connect to:", socketUrl);

//     const socketInstance: SocketType = io(socketUrl, {
//       auth: {
//         userId: session.data.user.id,
//       },
//       withCredentials: true,
//       autoConnect: true,
//       addTrailingSlash: false,
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       reconnectionAttempts: 5,
//     });

//     socketInstance.on("connect", () => {
//       console.log("✅ Connected to Socket.IO server");
//       setIsConnected(true);
//       setSocket(socketInstance);
//     });

//     socketInstance.on("disconnect", (reason) => {
//       console.log("❌ Disconnected from Socket.IO server. Reason:", reason);
//       setIsConnected(false);
//       setSocket(null);
//     });

//     socketInstance.on("connect_error", (error) => {
//       console.error("❌ Socket connection error:", error);
//     });

//     return () => {
//       console.log("Cleaning up socket connection");
//       socketInstance.disconnect();
//       setSocket(null);
//       setIsConnected(false);
//     };
//   }, [session.data?.user?.id]);

//   return (
//     <SocketContext.Provider value={{ socket, isConnected }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "../../../../lib/auth-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/types";

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

interface PresenceStatus {
  isOnline: boolean;
  lastSeen: string | null;
}

interface SocketContextType {
  socket: SocketType | null;
  isConnected: boolean;
  presenceMap: Record<string, PresenceStatus>;
  onlineUsers: string[];
  isUserOnline: (userId: string) => boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  presenceMap: {},
  onlineUsers: [],
  isUserOnline: () => false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [presenceMap, setPresenceMap] = useState<
    Record<string, PresenceStatus>
  >({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!session.data?.user?.id) {
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

    console.log("Attempting to connect to:", socketUrl);

    const socketInstance: SocketType = io(socketUrl, {
      auth: {
        userId: session.data.user.id,
      },
      withCredentials: true,
      autoConnect: true,
      addTrailingSlash: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Socket event handlers
    socketInstance.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
      setIsConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Disconnected from Socket.IO server. Reason:", reason);
      setIsConnected(false);
      setSocket(null);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    // ========== PRESENCE EVENT HANDLERS ==========
    socketInstance.on(
      "userOnline",
      (data: { userId: string; isOnline: boolean }) => {
        console.log("👤 User came online:", data.userId);
        setPresenceMap((prev) => ({
          ...prev,
          [data.userId]: {
            isOnline: true,
            lastSeen: null,
          },
        }));
        setOnlineUsers((prev) => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
      }
    );

    socketInstance.on(
      "userOffline",
      (data: { userId: string; isOnline: boolean }) => {
        console.log("👤 User went offline:", data.userId);
        setPresenceMap((prev) => ({
          ...prev,
          [data.userId]: {
            isOnline: false,
            lastSeen: new Date().toISOString(),
          },
        }));
        setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
      }
    );

    // Receive the complete online users list when connecting
    socketInstance.on("onlineUsers", (data: { users: string[] }) => {
      console.log("📋 Received complete online users list:", data.users);

      // Update online users list
      setOnlineUsers(data.users);

      // Build the complete presence map
      const newPresenceMap: Record<string, PresenceStatus> = {};
      data.users.forEach((userId) => {
        newPresenceMap[userId] = {
          isOnline: true,
          lastSeen: null,
        };
      });

      setPresenceMap(newPresenceMap);
    });

    // Request the online users list when connected
    const handleConnect = () => {
      console.log("🔄 Requesting online users list");
      // The backend should automatically send onlineUsers on connection
      // but you can also request it manually if needed
      socketInstance.emit("requestOnlineUsers",{});
    };

    socketInstance.on("connect", handleConnect);

    setSocket(socketInstance);

    return () => {
      console.log("🧹 Cleaning up socket connection");
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [session.data?.user?.id]);

  const isUserOnline = (userId: string) =>
    presenceMap[userId]?.isOnline ?? false;

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        presenceMap,
        onlineUsers,
        isUserOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
