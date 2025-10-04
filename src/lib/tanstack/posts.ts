import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

// Define a unique key for the posts query to manage its cache
const POSTS_QUERY_KEY = ["posts"];

// --- 1. FETCHER FUNCTIONS ---
// These functions are responsible for making the actual API calls.

/**
 * Fetches a paginated list of posts.
 * @param pageParam - The cursor (ID of the last post) for pagination.
 */
const fetchPosts = async ({ pageParam = null }: { pageParam: string | null }) => {
    const url = `/api/post${pageParam ? `?cursor=${pageParam}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Failed to fetch posts");
    }
    // The API should return an object like { posts: [], nextCursor: "..." }
    return res.json();
};

/**
 * Submits a new comment or reply.
 * @param newComment - The comment data including content, postId, and optional parentId.
 */
const addComment = async (newComment: { content: string; postId: string; parentId?: string }) => {
    // NOTE: Your API route for comments is at /api/comment, expecting `authorId`.
    // You'll need to pass the authorId here or, preferably, get it from the session on the server.
    // For this example, we assume the backend handles the authorId.
    const res = await fetch(`/api/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
    });

    if (!res.ok) {
        throw new Error("Failed to add comment");
    }
    return res.json();
};


// --- 2. CUSTOM HOOKS ---
// We wrap the TanStack Query hooks into our own custom hooks for reusability.

/**
 * Custom hook to fetch the infinite scroll feed of posts.
 */
export const useInfinitePosts = () => {
    return useInfiniteQuery({
        queryKey: POSTS_QUERY_KEY,
        queryFn: fetchPosts,
        initialPageParam: null, // Start with no cursor
        // This function tells TanStack Query how to get the cursor for the next page
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
};

/**
 * Custom hook for the "add comment" mutation.
 * Handles cache invalidation automatically to show the new comment.
 */
export const useAddComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
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