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
      <div className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-subtle h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="p-2 -ml-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <Avatar seed={otherUser?.anonName || "?"} className="h-8 w-8" />
            <span className="font-semibold text-foreground">
              {otherUser?.anonName || "Chat"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <Phone size={18} className="text-foreground" />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <Video size={18} className="text-foreground" />
          </button>
        </div>
      </div>

      <div className="pt-16 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-subtle border-t-[rgb(var(--accent))]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-muted">
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
                    <div className="bg-surface rounded-2xl p-4 max-w-[80%] border border-subtle">
                      <p className="text-sm text-muted mb-3">
                        {message.content}
                      </p>
                      <button
                        type="button"
                        onClick={handleAcceptRequest}
                        className="text-sm font-medium text-foreground px-4 py-2 rounded-lg bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/90 transition-colors"
                      >
                        Accept chat request
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isMe
                          ? "bg-[rgb(var(--accent))] text-foreground"
                          : "bg-surface border border-subtle text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMe ? "text-foreground/60" : "text-muted"
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

        <form
          onSubmit={handleSend}
          className="fixed bottom-16 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-subtle px-4 py-3"
        >
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 h-11 px-4 rounded-xl bg-surface-elevated border border-default text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-foreground transition-all active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </InstagramLayout>
  );
}
