import { motion } from "framer-motion";
import type React from "react";
import type { Post } from "@/../generated/prisma/client";
import PostCard from "./PostCard";

interface UserMetaData {
  posts: number;
  comments: number;
  notifications: number;
  commentLikes: number;
  loginLogs: number;
}

interface MyPostsProps {
  posts: Post[];
  metaData: UserMetaData;
}

const MyPosts: React.FC<MyPostsProps> = ({ posts, metaData }) => {
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
        My Posts
        <span className="ml-auto text-sm font-normal text-gray-500 dark:text-gray-400">
          {metaData.posts} total
        </span>
      </h2>

      {posts && posts.length > 0 ? (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12 px-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              role="img"
              aria-label="No posts"
            >
              <title>No posts</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No posts yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Share your first thought with the community!
          </p>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
