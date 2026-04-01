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
    return <Loader text={"Loading..."} />;
  }

  if (status === "error") {
    return (
      <ErrorFallback errorMessage={error?.message ?? "An error occurred."} />
    );
  }

  return (
    <div className="px-4 py-4">
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
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-muted hover:text-foreground hover:bg-surface transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}

      {data.pages[0]?.posts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted text-sm">No posts yet. Be the first to share something.</p>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
