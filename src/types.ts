import { Server, Member, User, Channel } from "../db/schema";

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & {
    user: User;
  })[];
  channels: Channel[];
};

// Socket.IO Event Types
export interface ServerToClientEvents {
  message: (data: MessageData) => void;
  userJoined: (data: UserJoinedData) => void;
  userLeft: (data: UserLeftData) => void;
  typing: (data: TypingData) => void;
  [key: string]: (data: any) => void;
}

export interface ClientToServerEvents {
  sendMessage: (data: SendMessageData) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  [key: string]: (data: any) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username: string;
}

// Data Types
export interface MessageData {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

export interface SendMessageData {
  roomId: string;
  content: string;
}

export interface UserJoinedData {
  userId: string;
  username: string;
  roomId: string;
}

export interface UserLeftData {
  userId: string;
  username: string;
  roomId: string;
}

export interface TypingData {
  userId: string;
  username: string;
  roomId: string;
}
