"use client";

import { formatDistanceToNow } from "date-fns";
import { enIN } from "date-fns/locale";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
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
  const [isHovered, setIsHovered] = useState(false);
  const authorName = post.author.anonMapping?.anonName ?? "Anonymous";

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: enIN,
  });

  const postVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  const commentsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={postVariants}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/40 bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-none transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar seed={authorName} className="ring-2 ring-indigo-500/20" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                {authorName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {timeAgo}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="More options"
          >
            <MoreHorizontal size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="relative">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
            {post.content}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-3 py-1.5 rounded-full transition-all duration-200 group/like"
          >
            <MessageSquare
              size={18}
              className="transition-transform duration-200 group-hover/like:scale-110"
            />
            <span className="font-medium">{post._count.comments}</span>
            <span className="text-gray-400">Comments</span>
            {showComments ? (
              <ChevronUp size={16} className="ml-auto" />
            ) : (
              <ChevronDown size={16} className="ml-auto" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            variants={commentsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30"
          >
            <div className="p-4 sm:p-5">
              {isAuthenticated ? (
                <CommentForm postId={post.id} />
              ) : (
                <div className="flex items-center justify-center py-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    Please{" "}
                    <a
                      href="/auth"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      sign in
                    </a>{" "}
                    to join the conversation
                  </span>
                </div>
              )}
              <div className="mt-4">
                <CommentList comments={post.comments} postId={post.id} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
