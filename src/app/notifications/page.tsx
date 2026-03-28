"use client";

import { Bell, Heart, MessageCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InstagramLayout from "@/components/InstagramLayout";
import { Avatar } from "@/components/posts/Avatar";
import { useAppSelector } from "@/redux/hooks";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  actorId: string | null;
  postId: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, router]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "COMMENT_LIKE":
      case "FOLLOW_ACCEPTED":
        return <Heart size={16} className="text-red-500" />;
      case "POST_COMMENT":
      case "COMMENT_REPLY":
        return <MessageCircle size={16} className="text-blue-500" />;
      case "FOLLOW_REQUEST":
      case "CHAT_REQUEST":
        return <User size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-neutral-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      return mins <= 1 ? "Just now" : `${mins}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.postId) {
      router.push(`/?post=${notification.postId}`);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <InstagramLayout>
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
          Notifications
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Bell size={32} className="text-neutral-400" />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">
              No notifications yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left
                  ${
                    notification.read
                      ? "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      : "bg-blue-50 dark:bg-blue-900/20"
                  }
                `}
              >
                <div className="relative">
                  <Avatar
                    seed={notification.message.split(" ")[0] || "?"}
                    className="h-10 w-10"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-0.5">
                    {getIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${notification.read ? "text-neutral-600 dark:text-neutral-400" : "text-neutral-900 dark:text-white"}`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </InstagramLayout>
  );
}
