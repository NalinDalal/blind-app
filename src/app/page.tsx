"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import InstagramLayout from "@/components/InstagramLayout";
import AddPost from "@/components/posts/AddPost";
import PostFeed from "@/components/posts/PostFeed";
import type { LatestPostQueryData } from "@/lib/tanstack/posts";
import {
  LATEST_POST_QUERY_KEY,
  POSTS_QUERY_KEY,
  useNewPostsNotifier,
} from "@/lib/tanstack/posts";
import { useAppSelector } from "@/redux/hooks";

function HomeContent() {
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
    <>
      <AnimatePresence>
        {shouldShowNewPostsButton && (
          <motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            <button
              type="button"
              onClick={handleShowNewPosts}
              className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full px-4 py-2 text-sm hover:opacity-90 transition-opacity"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                role="img"
                aria-label="New posts"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              New posts
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isAuthenticated && (
        <div className="px-4 pt-4">
          <AddPost />
        </div>
      )}
      <PostFeed />
    </>
  );
}

export default function Home() {
  return (
    <InstagramLayout>
      <HomeContent />
    </InstagramLayout>
  );
}
