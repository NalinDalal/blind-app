"use client";

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

  return (
    <div className="px-4">
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

      {hasNextPage && (
        <div className="flex justify-center py-6">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-sm font-semibold text-blue-500 hover:text-blue-600 disabled:opacity-50 transition-colors"
          >
            {isFetchingNextPage ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
