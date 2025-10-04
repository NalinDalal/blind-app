"use client";
import {useRouter} from "next/navigation";
import toast from "react-hot-toast";
import {useAppDispatch, useAppSelector} from "@/redux/hooks";
import {logout} from "@/redux/slices/AuthSlice";
import PostFeed from "@/components/PostFeed";

/**
 * Renders the home hero for the Blind Platform with authentication-aware actions.
 *
 * Displays a title, descriptive subtitle, and two call-to-action controls. The primary control navigates to the authentication route when the user is not authenticated and dispatches sign-out when the user is authenticated; the secondary control is a static "Learn More" button.
 *
 * @returns The Home page React element.
 */
export default function Home() {
    const {isAuthenticated} = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const handlePush = () => {
        router.push(`/auth`);
    };
    const handleSignOut = () => {
        try {
            dispatch(logout());
            toast.success("Logout successfully");
        } catch (err) {
            toast.error(`Failed to logout`);
        }
    };
    return (
        <main
            className="flex min-h-screen w-full items-center justify-center p-4
                 bg-gray-50 text-gray-800
                 dark:bg-gradient-to-br dark:from-[#020024] dark:via-[#090979] dark:to-[#00d4ff] dark:text-gray-200"
        >
            <PostFeed/>
        </main>
    );
}
