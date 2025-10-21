"use client";

import { useState } from "react";
import { Check, X, Loader2, UserPlus } from "lucide-react";
import { useSocket } from "./providers/SocketContext";
import UserAvatar from "./user-avatar";
import { format } from "date-fns";
import { useFriends } from "../../../hooks/use-friends";
import ActionTooltip from "./action-tooltip";

interface FriendRequestsProps {
  userId: string | null;
}

export function FriendRequests({ userId }: FriendRequestsProps) {
  const { socket } = useSocket();
  const { pendingRequests, isLoadingRequests, acceptRequest, rejectRequest } =
    useFriends(socket, userId);

  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const handleAccept = async (requestId: string, senderUserId: string) => {
    setLoadingIds((prev) => new Set(prev).add(requestId));
    try {
      await acceptRequest(requestId, senderUserId);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleReject = async (requestId: string) => {
    setLoadingIds((prev) => new Set(prev).add(requestId));
    try {
      await rejectRequest(requestId);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  return (
    <ActionTooltip label="Friend Requests">
      <div className="relative">
        {/* Friend Requests Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition"
        >
          <UserPlus className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />

          {/* Badge */}
          {pendingRequests.length > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {pendingRequests.length > 99 ? "99+" : pendingRequests.length}
            </span>
          )}
        </button>

        {/* Requests Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-96 max-h-96 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-40 flex flex-col">
              {/* Header */}
              <div className="sticky top-0 bg-zinc-50 dark:bg-zinc-700 border-b border-zinc-200 dark:border-zinc-600 p-4">
                <h3 className="font-semibold text-sm">Friend Requests</h3>
              </div>

              {/* Requests List */}
              <div className="overflow-y-auto flex-1">
                {isLoadingRequests ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    No pending requests
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <UserAvatar
                            src={request.sender.imageUrl}
                            name={request.sender.name}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {request.sender.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {format(
                                new Date(request.createdAt),
                                "MMM d, HH:mm"
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleAccept(request.id, request.sender.id)
                            }
                            disabled={loadingIds.has(request.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition disabled:opacity-50"
                          >
                            {loadingIds.has(request.id) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={loadingIds.has(request.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition disabled:opacity-50"
                          >
                            {loadingIds.has(request.id) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ActionTooltip>
  );
}
