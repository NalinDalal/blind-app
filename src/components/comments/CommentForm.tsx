"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddComment } from "@/lib/tanstack/posts";
import { useAppSelector } from "@/redux/hooks";

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
    <form onSubmit={handleSubmit} className="flex items-center gap-2 my-4">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder || defaultPlaceholder}
        disabled={isPending}
        className="flex-grow bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md"
      />
      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? "Adding comment" : "Post"}
      </Button>
    </form>
  );
}
