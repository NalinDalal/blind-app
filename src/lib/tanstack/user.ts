import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import type {Post} from "@/generated/prisma";
import {POSTS_QUERY_KEY} from "@/lib/tanstack/posts";
import type {NewPostPayload, UserProfile} from "@/lib/tanstack/types";

export const USER_PROFILE_QUERY_KEY = (userId: string) => [
    "userProfile",
    userId,
];

/**
 * Fetches a user's me data from the API.
 * @param userId - The ID of the user to fetch.
 */
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
    const response = await fetch(`/api/user?id=${userId}`);
    if (!response.ok) {
        throw new Error(`Failed to Fetch User Profile`);
    }
    return (await response.json()) as UserProfile;
};

/**
 * Submits a new post to the API.
 * @param newPost - The content of the new post.
 */

const createNewPost = async (newPost: NewPostPayload) => {
    console.log(`Creating new post: `, newPost);
    const response = await fetch(`/api/post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
    });
    if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to create post`);
    }
    return (await response.json()) as Post;
};

// --- Custom Hooks ---

/**
 * TanStack Query hook to fetch a user's me data.
 *
 * @param userId - The ID of the user whose me is being viewed.
 * @param initialData - Optional initial data to populate the cache.
 */

export const useUserProfile = (userId: string, initialData?: UserProfile) => {
    return useQuery<UserProfile>({
        queryKey: USER_PROFILE_QUERY_KEY(userId),
        queryFn: () => fetchUserProfile(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        initialData,
    });
};

/**
 * TanStack Query mutation hook for creating a new post.
 *
 * Handles optimistic updates and query invalidation on success.
 */

export const useCreatePost = (loggedInUserId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createNewPost,

        // 1. Optimistically update the UI
        onMutate: async (_newPost: NewPostPayload) => {
            await queryClient.cancelQueries({
                queryKey: USER_PROFILE_QUERY_KEY(loggedInUserId),
            });
            const previousProfile = queryClient.getQueryData<UserProfile>(
                USER_PROFILE_QUERY_KEY(loggedInUserId),
            );

            if (previousProfile) {
                queryClient.setQueryData<UserProfile>(
                    USER_PROFILE_QUERY_KEY(loggedInUserId),
                    {
                        ...previousProfile,
                        _count: {
                            ...previousProfile._count,
                            posts: previousProfile._count.posts + 1,
                        },
                    },
                );
            }
            return {previousProfile};
        },

        // 2. On success, show a toast. `onSettled` will handle invalidation.
        onSuccess: () => {
            toast.success("Post created successfully!");
        },

        // 3. On error, roll back the optimistic update using the context
        onError: (error, _variables, context) => {
            toast.error(error.message || "An error occurred.");
            if (context?.previousProfile) {
                queryClient.setQueryData(
                    USER_PROFILE_QUERY_KEY(loggedInUserId),
                    context.previousProfile,
                );
            }
        },

        // 4. Always refetch after the mutation is done (either success or error)
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: USER_PROFILE_QUERY_KEY(loggedInUserId),
            });
            queryClient.invalidateQueries({queryKey: POSTS_QUERY_KEY});
        },
    });
};
