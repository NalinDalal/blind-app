"use client";

import { motion } from "framer-motion";
import React from "react";
import { useInfinitePosts } from "@/lib/tanstack/posts";
import { useAppSelector } from "@/redux/hooks";
import { PostItem } from "./PostItem";

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

  // --- Styled Status Indicators ---

  if (status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <svg
          className="animate-spin h-8 w-8 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">
          Loading posts...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
          Something went wrong
        </p>
        <p className="mt-1 text-sm text-red-500 dark:text-red-300">
          {error.message}
        </p>
      </div>
    );
  }

  // --- Animation Variants ---

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // --- Main Component Render ---

  return (
    // The outer section with max-width and padding is removed, as it's now handled by the parent Home page component.
    <div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {data.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </React.Fragment>
        ))}
      </motion.div>

      <div className="flex justify-center mt-10">
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out hover:scale-105"
        >
          {isFetchingNextPage ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Loading more...</span>
            </>
          ) : hasNextPage ? (
            "Load More"
          ) : (
            "You've reached the end"
          )}
        </button>
      </div>
    </div>
  );
};

export default PostFeed;
