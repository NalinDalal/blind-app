import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Comment } from "@/generated/prisma";
import type { InfinitePostsData, NewCommentPayload } from "./types";
// Define a unique key for the posts query to manage its cache
export const POSTS_QUERY_KEY = ["posts"];

// --- 1. FETCHER FUNCTIONS ---
// These functions are responsible for making the actual API calls.

/**
 * Fetches a paginated list of posts.
 * @param pageParam - The cursor (ID of the last post) for pagination.
 */
const fetchPosts = async ({
  pageParam = null,
}: {
  pageParam: string | null;
}): Promise<InfinitePostsData> => {
  const url = `/api/post${pageParam ? `?cursor=${pageParam}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
};

/**
 * Submits a new comment or reply.
 * @param newComment - The comment data including content, postId, and optional parentId.
 */
const addComment = async (newComment: NewCommentPayload) => {
  const res = await fetch(`/api/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newComment),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to add comment");
  }
  return res.json();
};

// --- 2. CUSTOM HOOKS ---
// We wrap the TanStack Query hooks into our own custom hooks for reusability.

/**
 * Custom hook to fetch the infinite scroll feed of posts.
 */
export const useInfinitePosts = () => {
  return useInfiniteQuery<
    InfinitePostsData,
    Error,
    InfiniteData<InfinitePostsData>,
    string[],
    string | null
  >({
    queryKey: POSTS_QUERY_KEY,
    queryFn: fetchPosts,
    initialPageParam: null, // Start with no cursor
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
};

// --- FETCHER for the new endpoint ---
const fetchLatestPostId = async (): Promise<{
  latestPostId: string | null;
}> => {
  const res = await fetch("/api/post/latest");
  if (!res.ok) {
    throw new Error("Failed to fetch latest post ID");
  }
  return res.json();
};

/**
 * Custom hook to periodically check for new posts.
 * It does NOT fetch the post data, only the ID of the latest post.
 *
 * @param firstPostId The ID of the first post currently visible in the user's feed.
 */
export const useNewPostsNotifier = (firstPostId: string | undefined) => {
  return useQuery({
    queryKey: ["latestPost"],
    queryFn: fetchLatestPostId,
    // Poll every 30 seconds
    refetchInterval: 30000,
    // This query is only enabled if we have a firstPostId to compare against
    // enabled: !!firstPostId, // disabled for the empty feed

    select: (data) => {
      const latestPostIdFromServer = data.latestPostId;

      // If the server has no posts, there are no new posts.
      if (!latestPostIdFromServer) {
        return { hasNewPosts: false };
      }

      // If the user's feed is empty but the server has a post, it's a new post.
      if (!firstPostId && latestPostIdFromServer) {
        return { hasNewPosts: true };
      }

      // If the latest post on the server is different from the one the user sees, there are new posts.
      return { hasNewPosts: latestPostIdFromServer !== firstPostId };
    },
  });
};

/**
 * Custom hook for the "add comment" mutation.
 * Handles cache invalidation automatically to show the new comment.
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation<Comment, Error, NewCommentPayload>({
    mutationFn: addComment,
    // This is the key part for handling stale data
    onSuccess: () => {
      // When a comment is successfully added, invalidate the 'posts' query.
      // This tells TanStack Query that the data for this key is stale,
      // and it will automatically refetch it, updating the UI with the new comment.
      console.log("Comment added, invalidating posts query to refetch.");
      return queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
    },
    onError: (error) => {
      // You can add global error handling here, e.g., showing a toast notification.
      console.error("Failed to add comment:", error);
    },
  });
};
