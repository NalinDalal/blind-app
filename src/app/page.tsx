"use client";
import toast from "react-hot-toast";
import {useAppDispatch, useAppSelector} from "@/redux/hooks";
import {logoutUser} from "@/redux/slices/AuthSlice";
import PostFeed from "@/components/PostFeed";
import React from "react";
import type {LatestPostQueryData} from "@/lib/tanstack/posts";
import {LATEST_POST_QUERY_KEY, POSTS_QUERY_KEY, useNewPostsNotifier} from "@/lib/tanstack/posts";
import {useQueryClient} from "@tanstack/react-query";
import {Button} from "@/components/ui/button";
import Link from "next/link";

/**
 * Renders the Home page with the post-feed and an optional "New posts available" notifier.
 *
 * When newer posts are detected, a notifier button is shown; activating it resets the notifier state, refetches the feed, and scrolls to the top to reveal the latest posts.
 *
 * @returns The Home page React element
 */
export default function Home() {
    const {isAuthenticated} = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    const queryClient = useQueryClient();

    const {data: newPostsData} = useNewPostsNotifier();
    const [lastSeenLatestPostId, setLastSeenLatestPostId] = React.useState<string | null>(null);

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
        // Store the current latest post ID to update our tracking
        const currentLatestPostId = newPostsData?.latestPostId;

        // STEP 1: Update the query cache to mark that we've seen this latest post
        // This prevents the button from showing again until a newer post arrives
        setLastSeenLatestPostId(currentLatestPostId ?? null);

        queryClient.setQueryData<LatestPostQueryData>(LATEST_POST_QUERY_KEY, (oldData) => {
            const safeOldData: LatestPostQueryData = typeof oldData === "object" && oldData !== null
                ? oldData
                : {latestPostId: null};

            return {
                ...safeOldData,
                hasNewPosts: false,
                latestPostId: currentLatestPostId ?? safeOldData.latestPostId ?? null,
                lastSeenLatestPostId: currentLatestPostId ?? null,
            };
        });

        // STEP 2: Refetch the main posts query to get the new content.
        await queryClient.invalidateQueries({queryKey: POSTS_QUERY_KEY});

        // STEP 3: Scroll the user to the top to see the new posts.
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const handleSignOut = () => {
        try {
            dispatch(logoutUser());
            toast.success("Logout successfully");
        } catch (err) {
            toast.error(`Failed to logout`);
        }
    };
    return (
        <main className="relative">
            {isAuthenticated ? (
                <Button type={"button"} onClick={handleSignOut}>
                    Logout
                </Button>
            ) : (
                <Link href={"/auth"}>Login</Link>
            )}
            <section>
                {shouldShowNewPostsButton && (
                    <div className={"absolute top-4 left-1/2 -translate-x-1/2 z-10"}>
                        <Button type={"button"} variant={"default"} onClick={handleShowNewPosts}
                                className="shadow-lg">
                            New posts available
                        </Button>
                    </div>
                )}
            </section>
            <section
                className="flex min-h-screen w-full items-center justify-center p-4
                 bg-gray-50 text-gray-800
                 dark:bg-gradient-to-br dark:from-[#020024] dark:via-[#090979] dark:to-[#00d4ff] dark:text-gray-200"
            >
                <PostFeed/>
            </section>
        </main>
    );
}