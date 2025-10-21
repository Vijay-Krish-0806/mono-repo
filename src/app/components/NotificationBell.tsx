"use client";

import { Bell, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSocket } from "./providers/SocketContext";
import { format } from "date-fns";
import { useNotifications } from "../../../hooks/use-notifications";
import ActionTooltip from "./action-tooltip";

interface NotificationBellProps {
  userId: string | null;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const { socket } = useSocket();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotifications(socket, userId);

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  return (
    <ActionTooltip label="Notifications">
      <div className="relative">
        {/* Bell Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition"
        >
          <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 max-h-96 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-50 flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-zinc-50 dark:bg-zinc-700 border-b border-zinc-200 dark:border-zinc-600 p-4 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-blue-500 hover:text-blue-600 transition"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer ${
                        !notification.isRead
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                            {notification.title}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                            {format(
                              new Date(notification.createdAt),
                              "MMM d, HH:mm"
                            )}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ActionTooltip>
  );
}
