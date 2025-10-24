"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Loader2,
  X,
  UserPlus,
  Clock,
  Check,
  AlertCircle,
} from "lucide-react";

import { useSocket } from "./providers/SocketContext";
import UserAvatar from "./user-avatar";
import { useFriends } from "../../../hooks/use-friends-invite";
import { Input } from "@/components/ui/input";

interface UserSearchProps {
  userId: string | null;
}

export function UserSearch({ userId }: UserSearchProps) {
  const { socket } = useSocket();
  const {
    searchResults,
    isSearching,
    searchUsers,
    sendRequest,
    cancelRequest,
  } = useFriends(socket, userId);

  const [searchInput, setSearchInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchInput(query);
      setError(null);
      if (query.length >= 2) {
        searchUsers(query);
      }
    },
    [searchUsers]
  );

  const handleSendRequest = useCallback(
    async (recipientId: string) => {
      setLoadingIds((prev) => new Set(prev).add(recipientId));
      try {
        await sendRequest(recipientId);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to send request");
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(recipientId);
          return next;
        });
      }
    },
    [sendRequest]
  );

  const handleCancelRequest = useCallback(
    async (requestId: string) => {
      try {
        await cancelRequest(requestId);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to cancel request");
      }
    },
    [cancelRequest]
  );

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3  transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          type="text"
          placeholder="Search by username..."
          value={searchInput}
          onChange={handleSearch}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            onClick={() => {
              setIsOpen(false);
              setSearchInput("");
            }}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-50 max-h-96 overflow-y-auto">
            {searchInput.length < 2 ? (
              <div className="p-4 text-center text-sm text-zinc-500 z-50">
                Type at least 2 characters to search
              </div>
            ) : isSearching ? (
              <div className="p-4 text-center">
                <Loader2 className="w-4 h-4 animate-spin mx-auto text-zinc-400" />
              </div>
            ) : error ? (
              <div className="p-4 flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-sm text-zinc-500 ">
                No users found
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar
                        src={user.imageUrl || ""}
                        name={user.name || "User"}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="ml-2">
                      {user.requestStatus === "ACCEPTED" ? (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Check className="w-4 h-4" />
                          <span>Friends</span>
                        </div>
                      ) : user.requestStatus === "PENDING" ? (
                        user.isRequestSender ? (
                          <button
                            onClick={() =>
                              user.requestId &&
                              handleCancelRequest(user.requestId)
                            }
                            disabled={loadingIds.has(user.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 transition disabled:opacity-50"
                          >
                            {loadingIds.has(user.id) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                            <Clock className="w-4 h-4" />
                            <span>Pending</span>
                          </div>
                        )
                      ) : user.requestStatus === "REJECTED" ? (
                        <button
                          onClick={() => handleSendRequest(user.id)}
                          disabled={loadingIds.has(user.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition disabled:opacity-50"
                        >
                          {loadingIds.has(user.id) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserPlus className="w-3 h-3" />
                          )}
                          <span>Add</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(user.id)}
                          disabled={loadingIds.has(user.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition disabled:opacity-50"
                        >
                          {loadingIds.has(user.id) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserPlus className="w-3 h-3" />
                          )}
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
