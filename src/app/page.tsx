"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import AddPost from "@/components/posts/AddPost";
import PostFeed from "@/components/posts/PostFeed";
import { Button } from "@/components/ui/button";
import type { LatestPostQueryData } from "@/lib/tanstack/posts";
import {
  LATEST_POST_QUERY_KEY,
  POSTS_QUERY_KEY,
  useNewPostsNotifier,
} from "@/lib/tanstack/posts";
import { useAppSelector } from "@/redux/hooks";

export default function Home() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: newPostsData } = useNewPostsNotifier();
  const [lastSeenLatestPostId, setLastSeenLatestPostId] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    if (newPostsData?.latestPostId && lastSeenLatestPostId === null) {
      setLastSeenLatestPostId(newPostsData.latestPostId);
    }
  }, [newPostsData?.latestPostId, lastSeenLatestPostId]);

  const shouldShowNewPostsButton = Boolean(
    newPostsData?.latestPostId &&
      lastSeenLatestPostId &&
      newPostsData.latestPostId !== lastSeenLatestPostId,
  );

  const handleShowNewPosts = async () => {
    const currentLatestPostId = newPostsData?.latestPostId;

    setLastSeenLatestPostId(currentLatestPostId ?? null);

    queryClient.setQueryData<LatestPostQueryData>(
      LATEST_POST_QUERY_KEY,
      (oldData) => {
        const safeOldData: LatestPostQueryData =
          typeof oldData === "object" && oldData !== null
            ? oldData
            : { latestPostId: null };

        return {
          ...safeOldData,
          hasNewPosts: false,
          latestPostId: currentLatestPostId ?? safeOldData.latestPostId ?? null,
          lastSeenLatestPostId: currentLatestPostId ?? null,
        };
      },
    );

    await queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-mesh -z-10" />

      <AnimatePresence>
        {shouldShowNewPostsButton && (
          <motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <button
              type="button"
              onClick={handleShowNewPosts}
              className="
                flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 
                hover:from-indigo-600 hover:to-purple-700 text-white font-semibold 
                rounded-full px-6 py-3 shadow-2xl shadow-indigo-500/30
                transition-all duration-200 ease-in-out hover:scale-105 active:scale-95
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                role="alert"
                aria-label="Show latest posts"
              >
                <title>Show latest posts</title>
                <path d="M12 5v14" />
                <path d="m19 12-7-7-7 7" />
              </svg>
              New posts available
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative flex min-h-screen flex-col items-center justify-start py-8 px-4 sm:px-6">
        <div className="w-full max-w-3xl space-y-8">
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AddPost />
            </motion.div>
          )}
          <PostFeed />
        </div>
      </section>
    </main>
  );
}
