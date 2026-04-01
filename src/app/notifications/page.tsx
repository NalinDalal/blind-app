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
  const { isAuthenticated } = useAppSelector((state) => state.auth);
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
        return <Heart size={14} className="text-red-500" />;
      case "POST_COMMENT":
      case "COMMENT_REPLY":
        return <MessageCircle size={14} className="text-[rgb(var(--accent))]" />;
      case "FOLLOW_REQUEST":
      case "CHAT_REQUEST":
        return <User size={14} className="text-green-500" />;
      default:
        return <Bell size={14} className="text-muted" />;
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
        <h1 className="text-xl font-bold text-foreground mb-6">
          Notifications
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-subtle border-t-[rgb(var(--accent))]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface flex items-center justify-center">
              <Bell size={28} className="text-muted" />
            </div>
            <p className="text-muted">
              No notifications yet
            </p>
            <p className="text-sm text-muted/60 mt-1">
              When you get activity, it will show up here
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
                  w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left
                  ${notification.read
                    ? "hover:bg-surface"
                    : "bg-surface border border-subtle"
                  }
                `}
              >
                <div className="relative">
                  <Avatar
                    seed={notification.message.split(" ")[0] || "?"}
                    className="h-10 w-10"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-1">
                    {getIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${notification.read ? "text-muted" : "text-foreground"}`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted/60 mt-0.5">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <span className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </InstagramLayout>
  );
}
