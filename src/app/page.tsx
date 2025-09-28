"use client";
import { ArrowRight, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/AuthSlice";


/**
 * Render the platform's welcome landing page with an authentication-aware primary action.
 *
 * The primary button navigates the user to `/auth` when unauthenticated; when authenticated it dispatches a logout action and shows success or error toast notifications. The component also displays a secondary "Learn More" button and themed responsive UI.
 *
 * @returns The React element representing the home landing page.
 */

export default function Home() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
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
      <section
        className="w-full max-w-3xl text-center rounded-2xl border border-gray-200 bg-white/60 p-8 shadow-2xl backdrop-blur-lg
                   dark:border-gray-700 dark:bg-black/30"
      >
        {/* Main Heading */}
        <h1
          className="text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl lg:text-7xl
                     dark:text-white"
        >
          Welcome to the{" "}
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Blind
          </span>{" "}
          Platform
        </h1>

        {/* Subheading */}
        <p
          className="mt-4 text-lg text-gray-600 md:text-xl
                     dark:text-gray-300"
        >
          Connect, share, and engage with a community where your voice matters,
          not your identity.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            type={"button"}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50
                       dark:focus:ring-offset-gray-900 cursor-pointer"
            onClick={!isAuthenticated ? handlePush : handleSignOut}
          >
            {!isAuthenticated ? (
              <>
                Get Started <ArrowRight className="h-5 w-5" />
              </>
            ) : (
              <span>Sign Out</span>
            )}
          </Button>
          <button
            type={"button"}
            className="flex items-center gap-2 rounded-full border border-gray-400 px-6 py-3 font-semibold text-gray-700 transition-colors duration-300 hover:bg-gray-100
                       dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            Learn More <Info className="h-5 w-5" />
          </button>
        </div>
      </section>
    </main>
  );
}
