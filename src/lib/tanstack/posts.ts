import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Comment } from "@/generated/prisma";
import type {
  CommentWithReplies,
  InfinitePostsData,
  NewCommentPayload,
} from "./types";
// Define a unique key for the post query to manage its cache
export const POSTS_QUERY_KEY = ["posts"];

interface LikeCommentPayload {
  commentId: string;
  postId: string; // We need postId to find the comment in the cache
}

interface LikeCommentResponse {
  liked: boolean;
  likeCount: number;
}

export type LatestPostQueryData = {
  latestPostId: string | null;
  hasNewPosts?: boolean;
  lastSeenLatestPostId?: string | null;
};

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
    toast.error(errorData.error || "Failed to add comment");
    throw new Error(errorData.error || "Failed to add comment");
  }
  return res.json();
};

const toggleCommentLike = async (
  payload: LikeCommentPayload,
): Promise<LikeCommentResponse> => {
  const res = await fetch(`/api/like-comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentId: payload.commentId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    toast.error(errorData.error || "Failed to like comment");
    throw new Error(errorData.error || "Failed to like comment");
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
const fetchLatestPostId = async (): Promise<LatestPostQueryData> => {
  const res = await fetch("/api/post/latest");
  if (!res.ok) {
    console.log("Failed to fetch latest post ID");
    throw new Error("Failed to fetch latest post ID");
  }
  return res.json();
};

/**
 * Custom hook to periodically check for new posts.
 * It does NOT fetch the post data, only the ID of the latest post.
 */
export const LATEST_POST_QUERY_KEY = ["latestPost"] as const;

export const useNewPostsNotifier = () =>
  useQuery<LatestPostQueryData>({
    queryKey: LATEST_POST_QUERY_KEY,
    queryFn: fetchLatestPostId,
    // Poll every 30 seconds
    refetchInterval: 30000,
    // Don't refetch every time the user clicks back to the window.
    refetchOnWindowFocus: false,
    // Consider the data "fresh" for 25 seconds to prevent unnecessary refetches
    // between polling intervals.
    staleTime: 25000,
  });

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
      console.log(`Failed to add comment: ${error?.cause?.toString()}`);
    },
  });
};

/**
 * Custom hook for toggling a like on a comment.
 * It manually updates the specific comment in the cache on success
 * to avoid a full refetch of all posts.
 */

export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation<LikeCommentResponse, Error, LikeCommentPayload>({
    mutationFn: toggleCommentLike,
    onSuccess: (data, variables) => {
      // Manually update the query cache
      queryClient.setQueryData<InfiniteData<InfinitePostsData>>(
        POSTS_QUERY_KEY,
        (oldData) => {
          if (!oldData) return;

          // Create a deep copy of the pages to avoid mutation issues
          const newPages = oldData.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) => {
              // Find the post that contains the liked comment
              if (post.id !== variables.postId) {
                return post;
              }

              // Recursive function to find and update the comment or reply
              const updateComment = (
                comment: CommentWithReplies,
              ): CommentWithReplies => {
                if (comment.id === variables.commentId) {
                  // This is the comment we want to update
                  return {
                    ...comment,
                    _count: { commentLikes: data.likeCount },
                    likedByMe: data.liked,
                  };
                }
                // Otherwise, check its replies
                return {
                  ...comment,
                  replies: comment.replies.map(updateComment),
                };
              };

              // Return the post with the updated comments list
              return {
                ...post,
                comments: post.comments.map(updateComment),
              };
            }),
          }));

          return { ...oldData, pages: newPages };
        },
      );
    },
    onError: (_error) => {
      toast.error("Failed to toggle comment like");
    },
  });
};
