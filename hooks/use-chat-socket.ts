import { useSocket } from "@/app/components/providers/SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { Member, Message, User } from "../db/schema";
import { useEffect } from "react";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    user: User;
  };
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      console.log("❌ Socket not available");
      return;
    }

    console.log(`🔊 Listening to: ${addKey}, ${updateKey}`);

    // Handle message updates (edit/delete)
    socket.on(updateKey, (data: any) => {
      console.log(`📥 Received update on ${updateKey}:`, data);

      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: MessageWithMemberWithProfile) => {
              if (data.action === "delete") {
                // Handle delete action
                if (item.id === data.messageId) {
                  return {
                    ...item,
                    deleted: true,
                    content: "This message was deleted",
                  };
                }
              } else if (data.action === "update") {
                // Handle update action
                if (item.id === data.message.id) {
                  return data.message;
                }
              }
              return item;
            }),
          };
        });

        return { ...oldData, pages: newData };
      });
    });

    // Handle new messages
    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      console.log(`📥 Received new message on ${addKey}:`, message);

      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [{ items: [message] }],
          };
        }

        const newData = [...oldData.pages];
        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    return () => {
      console.log(`🧹 Cleaning up listeners for ${addKey}, ${updateKey}`);
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [queryKey, addKey, updateKey, socket, queryClient]);
};
