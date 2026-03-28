"use client";

import { formatDistanceToNow } from "date-fns";
import { enIN } from "date-fns/locale";
import { motion } from "framer-motion";
import { Reply, ThumbsUp } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Avatar } from "@/components/posts/Avatar";
import { useToggleCommentLike } from "@/lib/tanstack/posts";
import type { CommentWithReplies } from "@/lib/tanstack/types";
import { cn } from "@/utils/ui";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface CommentItemProps {
  comment: CommentWithReplies;
  postId: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const authorName = comment.author.anonMapping?.anonName ?? "Anonymous";
  const { mutate: toggleLike, isPending: isLikePending } =
    useToggleCommentLike();

  const commentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const likeCount = comment._count?.commentLikes ?? 0;
  const isLikedByMe = !!comment.likedByMe;

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: enIN,
  });

  const handleLikeClick = () => {
    toggleLike({
      postId,
      commentId: comment.id,
    });
  };

  return (
    <motion.div
      variants={commentVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="flex items-start gap-3">
        <Avatar
          seed={authorName}
          className="h-9 w-9 mt-0.5 ring-2 ring-indigo-500/10"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100/80 dark:bg-gray-800/60 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {authorName}
              </p>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">{timeAgo}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-1.5 ml-2">
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={isLikePending}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-all duration-200 disabled:cursor-not-allowed hover:scale-105",
                isLikedByMe
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400",
              )}
            >
              <ThumbsUp
                size={14}
                className={cn(
                  "transition-transform duration-200",
                  isLikedByMe ? "scale-110" : "",
                )}
                fill={isLikedByMe ? "currentColor" : "none"}
              />
              <span>{likeCount > 0 ? likeCount : "Like"}</span>
            </button>

            {!comment.parentId && (
              <button
                type="button"
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hover:scale-105"
              >
                <Reply size={14} />
                <span>Reply</span>
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-3 ml-2">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSuccess={() => setIsReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-8 mt-4 ml-4 border-l-2 border-gray-200/60 dark:border-gray-700/40">
          <CommentList comments={comment.replies} postId={postId} />
        </div>
      )}
    </motion.div>
  );
};
