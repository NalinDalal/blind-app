"use client";

import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import PostFeed from "@/components/posts/PostFeed";
import { Button } from "@/components/ui/button";
import type { LatestPostQueryData } from "@/lib/tanstack/posts";
import {
  LATEST_POST_QUERY_KEY,
  POSTS_QUERY_KEY,
  useNewPostsNotifier,
} from "@/lib/tanstack/posts";

/**
 * Renders the Home page with a responsive post-feed and an animated "New posts available" notifier.
 *
 * This enhanced UI uses Framer Motion for animations and refined Tailwind CSS for a modern look.
 * When newer posts are detected, a notifier button animates from the top; activating it refetches
 * the feed and scrolls smoothly to the top to reveal the latest content.
 *
 * @returns The Home page React element
 */
export default function Home() {
  const queryClient = useQueryClient();

  const { data: newPostsData } = useNewPostsNotifier();
  const [lastSeenLatestPostId, setLastSeenLatestPostId] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    // Initialize the last seen post ID when the component first loads data
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

    // Update state to hide the button immediately
    setLastSeenLatestPostId(currentLatestPostId ?? null);

    // Update the query cache to reflect that the user has seen the latest posts
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

    // Refetch the main posts query to get the new content
    await queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });

    // Smoothly scroll the user to the top to see the new posts
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    // The main container is relative to position the notification button
    <main className="relative">
      {/* Animated Notification Section */}
      <AnimatePresence>
        {shouldShowNewPostsButton && (
          <motion.div
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Button
              type="button"
              onClick={handleShowNewPosts}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-3 shadow-2xl transition-transform duration-200 ease-in-out hover:scale-105"
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
              >
                <path d="M12 5v14" />
                <path d="m19 12-7-7-7 7" />
              </svg>
              New posts available
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Section */}
      <section
        className="flex min-h-screen w-full flex-col items-center justify-start p-4 sm:p-6
                 bg-gray-100
                 dark:bg-gray-900"
      >
        <div className="w-full max-w-3xl mt-12">
          {/* PostFeed is now wrapped in a container that controls its max-width for readability */}
          <PostFeed />
        </div>
      </section>
    </main>
  );
}
