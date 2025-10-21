import { Server, Member, User, Channel } from "../db/schema";

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & {
    user: User;
  })[];
  channels: Channel[];
};

// Server-to-Client Events
export interface ServerToClientEvents {
  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;

  // Presence events
  userOnline: (data: { userId: string; isOnline: boolean }) => void;
  userOffline: (data: { userId: string; isOnline: boolean }) => void;
  onlineUsers: (data: { users: string[] }) => void;

  // User management events
  userJoined: (data: { userId: string; username: string }) => void;
  userLeft: (data: { userId: string; username: string }) => void;
  userList: (users: Array<{ id: string; username: string }>) => void;

  // Messaging events
  message: (data: {
    id: string;
    userId: string;
    username: string;
    content: string;
    timestamp: Date;
    room?: string;
  }) => void;

  // Room events
  roomCreated: (data: { roomId: string; roomName: string }) => void;
  roomDeleted: (data: { roomId: string }) => void;
  joinedRoom: (data: {
    roomId: string;
    users: Array<{ id: string; username: string }>;
  }) => void;
  leftRoom: (data: { roomId: string }) => void;

  // Notification events
  notification: (data: {
    type: "info" | "warning" | "error" | "success";
    message: string;
    duration?: number;
  }) => void;

  // Typing indicators
  userTyping: (data: {
    userId: string;
    username: string;
    isTyping: boolean;
    room?: string;
  }) => void;

  // System events
  systemMessage: (message: string) => void;
  reconnect: (attemptNumber: number) => void;

  // Error events
  error: (error: { code: string; message: string }) => void;
}

// Client-to-Server Events
export interface ClientToServerEvents {
  // Authentication
  authenticate: (
    token: string,
    callback: (
      success: boolean,
      user?: { id: string; username: string }
    ) => void
  ) => void;

  // Presence management
  requestOnlineUsers: (data: {}, callback?: (users: string[]) => void) => void;

  // User actions
  setUsername: (
    username: string,
    callback: (success: boolean, error?: string) => void
  ) => void;

  // Messaging
  sendMessage: (data: {
    content: string;
    room?: string;
    replyTo?: string;
  }) => void;

  // Room management
  createRoom: (
    roomName: string,
    callback: (success: boolean, roomId?: string, error?: string) => void
  ) => void;
  joinRoom: (
    roomId: string,
    callback: (success: boolean, error?: string) => void
  ) => void;
  leaveRoom: (roomId: string) => void;

  // Typing indicators
  startTyping: (room?: string) => void;
  stopTyping: (room?: string) => void;

  // Presence
  ping: (callback: () => void) => void;

  // File sharing (if needed)
  requestFileUpload: (
    data: { fileName: string; fileSize: number },
    callback: (approved: boolean, uploadUrl?: string) => void
  ) => void;

  // Admin actions (if applicable)
  kickUser: (userId: string, reason: string) => void;
  banUser: (userId: string, reason: string) => void;
}

/*
I will frontend routes
Just give what to send to backend
If it is bearer token or userId or any params 

If they are correct leave them


```typescript
const response = await axios.post(
          `${
            process.env.NEXT_PUBLIC_SOCKET_URL
          }/api/friends/search?query=${encodeURIComponent(query)}`,
          { userId },
          { withCredentials: true }
        );const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/requests`,
          {
            senderId: userId,
            recipientId,
          },
          { withCredentials: true }
        );

const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/requests/pending/${userId}`,
        {
          withCredentials: true,
        }
      );
const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/requests/${requestId}/accept`,
          { userId },
          { withCredentials: true }
        );

const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/requests/${requestId}/reject`,
          { userId },
          { withCredentials: true }
        );

await axios.delete(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/requests/${requestId}`,
        {
          data: { userId },
          withCredentials: true,
        }
      );
const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/list/${userId}`,
        {
          withCredentials: true,
        }
      );

  const response = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notifications/${userId}?limit=50`,
        {
          credentials: "include",
        }
      );

const response = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notifications/count/${userId}`,
        {
          credentials: "include",
        }
      );
const response = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

const response = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notifications/${userId}/read-all`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

const url = qs.stringifyUrl({
        url: `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/channels`,
        query: {
          serverId: params.serverId,
        },
      });
      await axios.post(url, values);
await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/servers`,
        values
      );

 const url = qs.stringifyUrl({
        url: `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });
      await axios.delete(url);

await axios.delete(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/servers/${server?.id}`
      );

const url = qs.stringifyUrl({
        url: `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });
      await axios.patch(url, values);

await axios.patch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/servers/${server?.id}`,
        values
      );

 await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/servers/${session.data?.user.id}`,
        values
      );

 const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/servers/${server?.id}/invite-code`
      );

await axios.patch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/servers/${server?.id}/leave`
      );

const url = qs.stringifyUrl({
        url: `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/members/${memberId}`,
        query: {
          serverId: server?.id,
        },
      });

      const response = await axios.delete(url);

```


```typescript

```
*/
