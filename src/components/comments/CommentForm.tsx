"use client";

import type React from "react";
import { useState } from "react";
import { Send } from "lucide-react";
import { useAddComment } from "@/lib/tanstack/posts";
import { useAppSelector } from "@/redux/hooks";
import { Avatar } from "@/components/posts/Avatar";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  placeholder,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const { mutate: addComment, isPending } = useAddComment();
  const userId = useAppSelector((state) => state.auth.userId);
  const { data: userData } = useAppSelector((state) => state.auth);

  const defaultPlaceholder = parentId ? "Write a reply..." : "Add a comment...";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || !userId) return;

    addComment(
      { content, postId, authorId: userId, parentId },
      {
        onSuccess: () => {
          setContent("");
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 my-3">
      <Avatar
        seed={userData?.anonName || "Anonymous"}
        className="h-8 w-8 flex-shrink-0"
      />
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder || defaultPlaceholder}
        disabled={isPending}
        className="flex-1 h-10 px-4 rounded-xl bg-surface border border-default text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition-all"
      />
      <button
        type="submit"
        disabled={!content.trim() || isPending}
        className="p-2.5 rounded-xl bg-[rgb(var(--accent))] text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-[rgb(var(--accent))]/90 active:scale-95"
      >
        <Send size={18} />
      </button>
    </form>
  );
}
