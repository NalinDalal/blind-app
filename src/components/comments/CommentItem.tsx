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
          className="h-8 w-8 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-surface rounded-2xl px-4 py-3 border border-subtle">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm text-foreground">
                {authorName}
              </p>
              <span className="text-xs text-muted">·</span>
              <span className="text-xs text-muted">{timeAgo}</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-1.5 ml-2">
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={isLikePending}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-all duration-200 disabled:cursor-not-allowed",
                isLikedByMe
                  ? "text-[rgb(var(--accent))]"
                  : "text-muted hover:text-foreground",
              )}
            >
              <ThumbsUp
                size={14}
                className={cn(
                  "transition-all duration-200",
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
                className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
              >
                <Reply size={14} />
                <span>Reply</span>
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-2 ml-2">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSuccess={() => setIsReplying(false)}
                placeholder="Write a reply..."
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-8 mt-3 ml-4 border-l-2 border-subtle">
          <CommentList comments={comment.replies} postId={postId} />
        </div>
      )}
    </motion.div>
  );
};
