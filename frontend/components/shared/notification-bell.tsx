"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatRelative } from "@/lib/utils/format";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/store/api/notifications.api";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: countData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30_000,
  });
  const { data: notifData } = useGetNotificationsQuery({}, { skip: !open });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const unreadCount = countData?.count ?? 0;
  const notifications = notifData?.data ?? [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-neutral-800">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-accent-600 hover:text-accent-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-neutral-400">
                No notifications yet
              </p>
            ) : (
              notifications.map((notif) => (
                <button
                  type="button"
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) handleMarkRead(notif.id);
                  }}
                  className={`w-full border-b border-neutral-50 px-4 py-3 text-left transition hover:bg-neutral-50 ${
                    !notif.isRead ? "bg-accent-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notif.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                    )}
                    <div className={!notif.isRead ? "" : "pl-4"}>
                      <p className="text-sm font-medium text-neutral-800">
                        {notif.title}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {formatRelative(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
