"use client";

import { Badge } from "@/components/ui/badge";
import { useSocket } from "./providers/SocketContext";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();
 
  if (!isConnected) {
    return (
      <Badge
        className="bg-yellow-600 text-white border-none"
        variant={"outline"}
      >
        Fallback: Polling every 1s
      </Badge>
    );
  }
  return (
    <Badge
      className="bg-emerald-600 text-white border-none"
      variant={"outline"}
    >
      Live : real time updates
    </Badge>
  );
};
