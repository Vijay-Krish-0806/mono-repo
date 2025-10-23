// ============================================
// FILE: hooks/use-friends.ts (NEW)
// ============================================

import { useState, useCallback, useEffect } from "react";
import { Socket } from "socket.io-client";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

interface SearchResult extends User {
  requestStatus: "PENDING" | "ACCEPTED" | "REJECTED" | null;
  requestId: string | null;
  isRequestSender: boolean;
}

interface FriendRequest {
  id: string;
  senderId: string;
  recipientId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  sender: User;
  createdAt: string;
}

export function useFriends(socket: Socket | null, userId: string | null) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  const router = useRouter();

  // Search users
  const searchUsers = useCallback(
    async (query: string) => {
      if (!userId || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.post(
          `${
            process.env.NEXT_PUBLIC_SOCKET_URL
          }/api/friends/search?query=${encodeURIComponent(query)}`,
          { userId },
          { withCredentials: true }
        );
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [userId]
  );

  // Send friend request
  const sendRequest = useCallback(
    async (recipientId: string) => {
      if (!userId) return;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/requests`,
          {
            senderId: userId,
            recipientId,
          },
          { withCredentials: true }
        );

        // Update search results
        setSearchResults((prev) =>
          prev.map((user) =>
            user.id === recipientId
              ? {
                  ...user,
                  requestStatus: "PENDING",
                  requestId: response.data.request.id,
                  isRequestSender: true,
                }
              : user
          )
        );

        return response.data;
      } catch (error: any) {
        console.error("Error sending friend request:", error);
        throw error;
      }
    },
    [userId]
  );

  // Get pending requests
  const fetchPendingRequests = useCallback(async () => {
    if (!userId) return;

    setIsLoadingRequests(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/requests/pending/${userId}`,
        {
          withCredentials: true,
        }
      );
      setPendingRequests(response.data);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [userId]);

  // Accept friend request
  const acceptRequest = useCallback(
    async (requestId: string, senderUserId: string) => {
      if (!userId) return;

      try {
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/requests/${requestId}/accept`,
          { userId },
          { withCredentials: true }
        );

        // Update pending requests
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== requestId)
        );

        router.push(`/me/conversations/${senderUserId}`);

        return response.data;
      } catch (error: any) {
        console.error("Error accepting friend request:", error);
        throw error;
      }
    },
    [userId, router]
  );

  // Reject friend request
  const rejectRequest = useCallback(
    async (requestId: string) => {
      if (!userId) return;

      try {
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/requests/${requestId}/reject`,
          { userId },
          { withCredentials: true }
        );

        // Update pending requests
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== requestId)
        );

        return response.data;
      } catch (error: any) {
        console.error("Error rejecting friend request:", error);
        throw error;
      }
    },
    [userId]
  );

  // Cancel outgoing request
  const cancelRequest = useCallback(async (requestId: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/requests/${requestId}`,
        {
          data: { userId },
          withCredentials: true,
        }
      );

      // Update search results
      setSearchResults((prev) =>
        prev.map((user) =>
          user.requestId === requestId
            ? {
                ...user,
                requestStatus: null,
                requestId: null,
                isRequestSender: false,
              }
            : user
        )
      );
    } catch (error: any) {
      console.error("Error cancelling friend request:", error);
      throw error;
    }
  }, []);

  // Get friends list
  const fetchFriends = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/friends/list/${userId}`,
        {
          withCredentials: true,
        }
      );
      setFriends(response.data);
    } catch (error) {
      console.error("Error fetching friends list:", error);
    }
  }, [userId]);
  
  const openConversation = useCallback(
    (friendUserId: string) => {
      router.push(`/me/conversations/${friendUserId}`);
    },
    [router]
  );

  // Listen for incoming friend requests
  useEffect(() => {
    if (!socket) return;

    const handleFriendRequestReceived = (data: any) => {
      // Add new request to pending
      setPendingRequests((prev) => [
        {
          id: data.requestId,
          senderId: data.sender.id,
          recipientId: userId!,
          status: "PENDING",
          sender: data.sender,
          createdAt: data.createdAt,
        },
        ...prev,
      ]);
    };

    const handleFriendRequestAccepted = (data: any) => {
      // Add new friend
      setFriends((prev) => [data.recipient, ...prev]);

      // Update search results
      setSearchResults((prev) =>
        prev.map((user) =>
          user.id === data.recipient.id
            ? {
                ...user,
                requestStatus: "ACCEPTED",
              }
            : user
        )
      );
    };

    socket.on("friendRequestReceived", handleFriendRequestReceived);
    socket.on("friendRequestAccepted", handleFriendRequestAccepted);

    return () => {
      socket.off("friendRequestReceived", handleFriendRequestReceived);
      socket.off("friendRequestAccepted", handleFriendRequestAccepted);
    };
  }, [socket, userId]);

  // Initial fetch
  useEffect(() => {
    fetchPendingRequests();
    fetchFriends();
  }, [fetchPendingRequests, fetchFriends]);

  return {
    searchResults,
    pendingRequests,
    friends,
    isSearching,
    isLoadingRequests,
    searchUsers,
    sendRequest,
    openConversation,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    fetchPendingRequests,
    fetchFriends,
  };
}
