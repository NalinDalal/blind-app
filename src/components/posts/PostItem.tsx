"use client";

import { formatDistanceToNow } from "date-fns"; // Import the date utility
import { enIN } from "date-fns/locale";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { MessageSquare } from "lucide-react";
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
  const authorName = post.author.anonMapping?.anonName ?? "Anonymous";

  // --- Calculate Relative Time ---
  const timeAgo = String(
    `posted`.concat(
      "\t",
      formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true,
        locale: enIN,
      }),
    ),
  ).toWellFormed();

  // --- Animation Variants ---
  const postVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const commentsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={postVariants}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between mb-4">
          {/* Author Info (remains the same) */}
          <div className="flex items-center gap-3">
            <Avatar seed={authorName} />
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {authorName}
            </span>
          </div>
          {/* Timestamp (remains the same) */}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {timeAgo}
          </span>
        </div>

        {/* Post Content */}
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Meta & Comment Toggle */}
        <div className="mt-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <MessageSquare size={16} />
            <span>{post._count.comments} Comments</span>
          </button>
        </div>
      </div>

      {/* Collapsible Comment Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            variants={commentsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="border-t border-gray-200 dark:border-gray-700 px-6 pb-4 pt-2"
          >
            {isAuthenticated ? (
              <CommentForm postId={post.id} />
            ) : (
              <p className="text-sm text-gray-500 mt-4">
                Log in to add a comment.
              </p>
            )}
            <CommentList comments={post.comments} postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
