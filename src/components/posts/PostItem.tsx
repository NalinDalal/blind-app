"use client";

import { formatDistanceToNow } from "date-fns";
import { enIN } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowBigDown,
  ArrowBigUp,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import type { PostWithDetails } from "@/lib/tanstack/types";
import { Avatar } from "./Avatar";

interface PostItemProps {
  post: PostWithDetails;
  isAuthenticated: boolean;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  isAuthenticated,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState<"UPVOTE" | "DOWNVOTE" | null>(null);
  const [shareCount, setShareCount] = useState(0);
  const authorName = post.author.anonMapping?.anonName ?? "Anonymous";

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: enIN,
  });

  const handleVote = async (vote: "UPVOTE" | "DOWNVOTE") => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });

      const data = await res.json();
      if (res.ok) {
        setVoteCount(data.voteCount.score);
        setUserVote(data.userVote);
      } else {
        toast.error(data.error || "Failed to vote");
      }
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  const handleShare = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to share");
      return;
    }

    try {
      const res = await fetch(`/api/posts/${post.id}/share`, {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        setShareCount(data.shareCount);
        toast.success("Post shared!");

        const shareUrl = `${window.location.origin}/post/${post.id}`;
        await navigator.clipboard.writeText(shareUrl);
      } else {
        toast.error(data.error || "Failed to share");
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  return (
    <article className="p-4 rounded-2xl bg-surface border border-subtle mb-3">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => handleVote("UPVOTE")}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              userVote === "UPVOTE" 
                ? "text-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10" 
                : "text-muted hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            <ArrowBigUp
              size={22}
              className={userVote === "UPVOTE" ? "fill-current" : ""}
            />
          </button>
          <span
            className={`text-sm font-bold font-[family-name:var(--font-space-mono)] ${
              voteCount > 0
                ? "text-[rgb(var(--accent))]"
                : voteCount < 0
                  ? "text-blue-500"
                  : "text-muted"
            }`}
          >
            {voteCount || 0}
          </span>
          <button
            type="button"
            onClick={() => handleVote("DOWNVOTE")}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              userVote === "DOWNVOTE" 
                ? "text-blue-500 bg-blue-500/10" 
                : "text-muted hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            <ArrowBigDown
              size={22}
              className={userVote === "DOWNVOTE" ? "fill-current" : ""}
            />
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar
                  seed={authorName}
                  className="h-9 w-9 ring-2 ring-subtle"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-foreground">
                  {authorName}
                </span>
                <span className="text-xs text-muted">
                  {timeAgo}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
            >
              <MoreHorizontal
                size={18}
                className="text-muted"
              />
            </button>
          </div>

          <div className="py-1">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-subtle">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 rounded-lg hover:bg-surface-elevated transition-all duration-200 active:scale-90"
              >
                <Heart
                  size={20}
                  className={`transition-all duration-200 ${
                    isLiked
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-muted hover:text-red-500"
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setShowComments(!showComments)}
                className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
              >
                <MessageCircle
                  size={20}
                  className={`transition-colors ${showComments ? "text-[rgb(var(--accent))]" : "text-muted"}`}
                />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
              >
                <Share2
                  size={18}
                  className="text-muted"
                />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
            >
              <Bookmark
                size={18}
                className={`transition-colors ${
                  isSaved
                    ? "fill-foreground text-foreground"
                    : "text-muted"
                }`}
              />
            </button>
          </div>

          <div className="mt-2 px-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowComments(true)}
              className="text-xs font-medium text-muted hover:text-foreground transition-colors"
            >
              {post._count.comments} comments
            </button>
            {shareCount > 0 && (
              <p className="text-xs text-muted">{shareCount} shares</p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-subtle">
              {isAuthenticated ? (
                <CommentForm postId={post.id} />
              ) : (
                <p className="text-sm text-muted py-2">
                  <a href="/auth" className="text-foreground font-semibold hover:text-[rgb(var(--accent))] transition-colors">
                    Sign in
                  </a>{" "}
                  to comment
                </p>
              )}
              <CommentList comments={post.comments} postId={post.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};
