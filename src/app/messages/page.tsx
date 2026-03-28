"use client";

import { MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InstagramLayout from "@/components/InstagramLayout";
import { Avatar } from "@/components/posts/Avatar";
import { useAppSelector } from "@/redux/hooks";

interface ChatRoom {
  roomId: string;
  otherUser: {
    userId: string;
    anonName: string;
  } | null;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
    isChatRequest: boolean;
    requestAccepted: boolean;
  } | null;
  updatedAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAppSelector((state) => state.auth);
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    const fetchChats = async () => {
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          setChats(data);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [isAuthenticated, router]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (!isAuthenticated) return null;

  return (
    <InstagramLayout>
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
          Messages
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <MessageCircle size={32} className="text-neutral-400" />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 mb-2">
              No messages yet
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Follow users and accept their chat requests to start messaging
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.roomId}
                type="button"
                onClick={() => router.push(`/messages/${chat.roomId}`)}
                className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors text-left"
              >
                <Avatar
                  seed={chat.otherUser?.anonName || "?"}
                  className="h-12 w-12"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900 dark:text-white truncate">
                      {chat.otherUser?.anonName || "Unknown"}
                    </span>
                    {chat.lastMessage && (
                      <span className="text-xs text-neutral-400">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage ? (
                    <p
                      className={`text-sm truncate ${
                        chat.lastMessage.isChatRequest &&
                        !chat.lastMessage.requestAccepted
                          ? "text-blue-500 font-medium"
                          : "text-neutral-500 dark:text-neutral-400"
                      }`}
                    >
                      {chat.lastMessage.isChatRequest &&
                      !chat.lastMessage.requestAccepted
                        ? "Sent a message request"
                        : chat.lastMessage.senderId === userId
                          ? `You: ${chat.lastMessage.content}`
                          : chat.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-neutral-400">No messages yet</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </InstagramLayout>
  );
}
