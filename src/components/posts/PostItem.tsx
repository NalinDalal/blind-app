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
  Send,
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

        // Copy link to clipboard
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
    <article className="border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-4">
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            type="button"
            onClick={() => handleVote("UPVOTE")}
            className={`p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
              userVote === "UPVOTE" ? "text-orange-500" : "text-neutral-500"
            }`}
          >
            <ArrowBigUp
              size={24}
              className={userVote === "UPVOTE" ? "fill-current" : ""}
            />
          </button>
          <span
            className={`text-sm font-semibold ${
              voteCount > 0
                ? "text-orange-500"
                : voteCount < 0
                  ? "text-blue-500"
                  : "text-neutral-500"
            }`}
          >
            {voteCount || 0}
          </span>
          <button
            type="button"
            onClick={() => handleVote("DOWNVOTE")}
            className={`p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
              userVote === "DOWNVOTE" ? "text-blue-500" : "text-neutral-500"
            }`}
          >
            <ArrowBigDown
              size={24}
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
                  className="h-8 w-8 ring-2 ring-transparent hover:ring-pink-500 transition-all"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-black" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                  {authorName}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {timeAgo}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              <MoreHorizontal
                size={20}
                className="text-neutral-900 dark:text-white"
              />
            </button>
          </div>

          <div className="py-2">
            <p className="text-sm text-neutral-900 dark:text-white whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all active:scale-75"
              >
                <Heart
                  size={24}
                  className={`transition-all duration-200 ${
                    isLiked
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-neutral-900 dark:text-white"
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setShowComments(!showComments)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <MessageCircle
                  size={24}
                  className="text-neutral-900 dark:text-white"
                />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <Share2
                  size={22}
                  className="text-neutral-900 dark:text-white"
                />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              <Bookmark
                size={24}
                className={`transition-colors ${
                  isSaved
                    ? "fill-neutral-900 dark:fill-white text-neutral-900 dark:text-white"
                    : "text-neutral-900 dark:text-white"
                }`}
              />
            </button>
          </div>

          <div className="mt-1 px-1 flex items-center gap-3">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {isLiked
                ? `${Math.floor(Math.random() * 100) + 1} likes`
                : `${post._count.comments} comments`}
            </p>
            {shareCount > 0 && (
              <p className="text-sm text-neutral-500">{shareCount} shares</p>
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
            <div className="pt-3 pl-11">
              {isAuthenticated ? (
                <CommentForm postId={post.id} />
              ) : (
                <p className="text-sm text-neutral-500 py-2">
                  <a href="/auth" className="text-blue-500 font-semibold">
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
