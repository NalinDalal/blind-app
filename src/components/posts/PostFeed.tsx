"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInfinitePosts } from "@/lib/tanstack/posts";
import { useAppSelector } from "@/redux/hooks";
import { PostItem } from "./PostItem"; // We will create this next

const PostFeed = () => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfinitePosts();

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (status === "pending") return <p className="text-center p-4">Loading posts...</p>;
  if (status === "error") return <p className="text-center text-red-500 p-4">Error: {error.message}</p>;

  // Animation container for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Each post animates 0.1s after the previous one
      },
    },
  };

  return (
      <section className="max-w-2xl mx-auto py-8 px-4">
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
          {data.pages.map((page) =>
              page.posts.map((post) => (
                  <PostItem key={post.id} post={post} isAuthenticated={isAuthenticated} />
              )),
          )}
        </motion.div>

        <div className="flex justify-center mt-8">
          <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isFetchingNextPage
                ? "Loading more..."
                : hasNextPage
                    ? "Load More"
                    : "End of feed"}
          </button>
        </div>
      </section>
  );
};

export default PostFeed;