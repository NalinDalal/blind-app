"use client";

import { ArrowLeft, Phone, Send, Video } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import InstagramLayout from "@/components/InstagramLayout";
import { Avatar } from "@/components/posts/Avatar";
import { useAppSelector } from "@/redux/hooks";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string | null;
  isChatRequest: boolean;
  requestAccepted: boolean;
  status: string;
  createdAt: string;
  sender: {
    anonMapping: { anonName: string } | null;
  };
}

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, userId } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{
    userId: string;
    anonName: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roomId = params.roomId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);

          // Get other user from first message
          if (data.length > 0) {
            const other = data.find((m: Message) => m.senderId !== userId);
            if (other) {
              setOtherUser({
                userId: other.senderId,
                anonName: other.sender.anonMapping?.anonName || "Anonymous",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, router, roomId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/chat/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleAcceptRequest = async () => {
    const firstMessage = messages.find(
      (m) => m.isChatRequest && !m.requestAccepted,
    );
    if (!firstMessage) return;

    try {
      const res = await fetch(`/api/chat/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", messageId: firstMessage.id }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === firstMessage.id
              ? { ...m, requestAccepted: true, status: "DELIVERED" }
              : m,
          ),
        );
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) return null;

  return (
    <InstagramLayout>
      {/* Custom header for chat */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
          >
            <ArrowLeft size={24} className="text-neutral-900 dark:text-white" />
          </Link>
          <div className="flex items-center gap-2">
            <Avatar seed={otherUser?.anonName || "?"} className="h-8 w-8" />
            <span className="font-semibold text-neutral-900 dark:text-white">
              {otherUser?.anonName || "Chat"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
          >
            <Phone size={20} className="text-neutral-900 dark:text-white" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
          >
            <Video size={20} className="text-neutral-900 dark:text-white" />
          </button>
        </div>
      </div>

      <div className="pt-14 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-neutral-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-3">
            {messages.map((message) => {
              const isMe = message.senderId === userId;
              const isRequest =
                message.isChatRequest && !message.requestAccepted;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {isRequest && !isMe ? (
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-4 max-w-[80%]">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        {message.content}
                      </p>
                      <button
                        type="button"
                        onClick={handleAcceptRequest}
                        className="text-sm text-blue-500 font-semibold hover:underline"
                      >
                        Accept chat request
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isMe
                          ? "bg-blue-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMe ? "text-blue-100" : "text-neutral-400"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Chat input */}
        <form
          onSubmit={handleSend}
          className="fixed bottom-16 left-0 right-0 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 px-4 py-3"
        >
          <div className="flex items-center gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 h-10 px-4 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-full text-white transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </InstagramLayout>
  );
}
