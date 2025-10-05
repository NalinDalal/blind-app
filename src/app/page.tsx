"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PostFeed from "@/components/PostFeed";
import { Button } from "@/components/ui/button";
import {
  POSTS_QUERY_KEY,
  useInfinitePosts,
  useNewPostsNotifier,
} from "@/lib/tanstack/posts";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/AuthSlice";

/**
 * Renders the home hero for the Blind Platform with authentication-aware actions.
 *
 * Displays a title, descriptive subtitle, and two call-to-action controls. The primary control navigates to the authentication route when the user is not authenticated and dispatches sign-out when the user is authenticated; the secondary control is a static "Learn More" button.
 *
 * @returns The Home page React element.
 */
export default function Home() {
  useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const _handlePush = () => {
    router.push(`/auth`);
  };

  const queryClient = useQueryClient();

  const { data } = useInfinitePosts();

  // Get the ID of the very first post in our feed
  const firstPostId = data?.pages?.[0]?.posts?.[0]?.id;

  // Use the notifier hook, passing it the ID of the post at the top of our feed
  const { data: newPostsData } = useNewPostsNotifier(firstPostId);

  const handleShowNewPosts = async () => {
    // 1. Reset the notifier query. This will immediately remove the stale
    //    `hasNewPosts: true` state, hiding the button.
    await queryClient.resetQueries({ queryKey: ["latestPost"] });

    // 2. Invalidate the main posts query to fetch the new content.
    await queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });

    // 3. Scroll the user to the top to see the new posts.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const _handleSignOut = () => {
    try {
      dispatch(logout());
      toast.success("Logout successfully");
    } catch (err) {
      toast.error(`Failed to logout`);
    }
  };
  return (
    <main className="relative">
      <section>
        {newPostsData?.hasNewPosts && (
          <div className={"absolute top-4 left-1/2 -translate-x-1/2 z-10"}>
            <Button
              type={"button"}
              variant={"default"}
              onClick={handleShowNewPosts}
              className="shadow-lg"
            >
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
        <PostFeed />
      </section>
    </main>
  );
}
