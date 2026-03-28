"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";
import ErrorFallback from "@/components/ui/ErrorFallback";
import Loader from "@/components/ui/Loader";
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

  if (status === "pending") {
    return <Loader text={"Loading posts..."} />;
  }

  if (status === "error") {
    return (
      <ErrorFallback errorMessage={error?.message ?? "An error occurred."} />
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {data.pages.map((page, pageIndex) => (
          <React.Fragment
            key={`page-${pageIndex}-${page.posts[0]?.id || "empty"}`}
          >
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
        {hasNextPage ? (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="
              flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white
              bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full
              shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40
              hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              transition-all duration-300 ease-out
            "
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more...</span>
              </>
            ) : (
              <>
                <span>Load More</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Load more posts"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
            <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
            <span className="text-sm">You&apos;ve seen all posts</span>
            <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostFeed;
