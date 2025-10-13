import {NewPostPayload, UserProfile} from "@/lib/tanstack/types";
import {Post} from "@/generated/prisma"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {POSTS_QUERY_KEY} from "@/lib/tanstack/posts";

export const USER_PROFILE_QUERY_KEY = (userId: string) => ["userProfile", userId]

/**
 * Fetches a user's profile data from the API.
 * @param userId - The ID of the user to fetch.
 */
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
    const response = await fetch(`/api/user?id=${userId}`);
    if (!response.ok) {
        throw new Error(`Failed to Fetch User Profile`);
    }
    return await response.json() as UserProfile;
}

/**
 * Submits a new post to the API.
 * @param newPost - The content of the new post.
 */

const createNewPost = async (newPost: NewPostPayload) => {
    const response = await fetch(`/api/post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newPost)
    })
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create post`)
    }
    return await response.json() as Post
}

// --- Custom Hooks ---

/**
 * TanStack Query hook to fetch a user's profile data.
 *
 * @param userId - The ID of the user whose profile is being viewed.
 * @param initialData - Optional initial data to populate the cache.
 */

export const useUserProfile = (userId: string, initialData?: UserProfile) => {
    return useQuery<UserProfile>({
        queryKey: USER_PROFILE_QUERY_KEY(userId),
        queryFn: () => fetchUserProfile(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        initialData
    })
}

/**
 * TanStack Query mutation hook for creating a new post.
 *
 * Handles optimistic updates and query invalidation on success.
 */

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createNewPost,
        onSuccess: async (data, variables, context: UserProfile) => {
            toast.success("Post created successfully!");

            // Invalidate the main post-feed to show the new post at the top
            await queryClient.invalidateQueries({queryKey: POSTS_QUERY_KEY});

            // We can also intelligently invalidate the profile of the logged-in user if we know their ID
            const loggedInUserId = context.id; // Example of getting userId from context
            await queryClient.invalidateQueries({queryKey: USER_PROFILE_QUERY_KEY(loggedInUserId)});
        },
        onError: (error) => {
            // Show a toast notification on failure
            toast.error(error.message || "An error occurred.");
        },
    })
}
