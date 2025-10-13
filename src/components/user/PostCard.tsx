import React from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { enIN } from "date-fns/locale";
import { Flag } from "lucide-react"; // Icon for flagged posts
import { Post } from "@/generated/prisma";

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  // Framer Motion variant for a smooth entry animation
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: enIN,
  });

  return (
    <motion.div
      variants={itemVariants}
      className="p-4 bg-gray-100 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700"
    >
      {/* The main content of the post */}
      <p className="text-gray-800 dark:text-neutral-200 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Footer with timestamp and flagged status */}
      <div className="flex items-center justify-between mt-3 text-xs text-neutral-500 dark:text-neutral-400">
        <span>Posted {timeAgo}</span>

        {/* Conditionally render a badge if the post is flagged */}
        {post.isFlagged && (
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
            <Flag size={14} />
            <span>Flagged for Review</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;
