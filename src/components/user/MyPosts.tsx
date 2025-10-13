import React from "react";
import { motion } from "framer-motion";
import PostCard from "./PostCard";
import { Post } from "@/generated/prisma";

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
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        My Posts ({metaData.posts})
      </h2>

      {/* Check if there are any posts to display */}
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
        // Display a message if the user has no posts
        <div className="text-center py-8 px-4 bg-gray-50 dark:bg-neutral-900/50 rounded-lg">
          <p className="text-neutral-500 dark:text-neutral-400">
            You haven't made any posts yet. ✍️
          </p>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
