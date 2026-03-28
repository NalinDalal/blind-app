"use client";

import { formatDistanceToNow } from "date-fns";
import { enIN } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  Calendar,
  Edit,
  Grid3X3,
  Heart,
  MessageCircle,
  Settings,
  User,
  Video,
} from "lucide-react";
import { Avatar } from "@/components/posts/Avatar";
import ErrorFallback from "@/components/ui/ErrorFallback";
import Loader from "@/components/ui/Loader";
import { useUserProfile } from "@/lib/tanstack/user";
import { useAppSelector } from "@/redux/hooks";
import MyPosts from "./MyPosts";

const Profile = () => {
  const { userId } = useAppSelector((state) => state.auth);
  const { data, error, status } = useUserProfile(userId || "");

  if (status === "pending") {
    return (
      <div className="flex justify-center items-center p-6 min-h-[300px]">
        <Loader text={"Loading profile..."} />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="p-6">
        <ErrorFallback errorMessage={error?.message ?? "An error occurred."} />
      </div>
    );
  }

  const userName = data?.anonMapping?.anonName || "Anonymous_Eagle";
  const userEmail = data?.email || "john.doe@oriental.ac.in";
  const accountCreationDate = formatDistanceToNow(
    data?.createdAt || new Date(),
    {
      addSuffix: true,
      locale: enIN,
    },
  );

  const posts = data?._count?.posts || 0;
  const likes = data?._count?.commentLikes || 0;
  const comments = data?._count?.comments || 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-xl mx-auto px-4">
        <div className="py-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar
                seed={userName}
                size={"lg"}
                className="h-20 w-20 ring-4 ring-transparent"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {userName}
                </h1>
                <button
                  type="button"
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <Settings
                    size={20}
                    className="text-neutral-900 dark:text-white"
                  />
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {posts}
                  </span>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    posts
                  </p>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {likes}
                  </span>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    likes
                  </p>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {comments}
                  </span>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    comments
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-neutral-900 dark:text-white">
              {userName}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <User size={14} />
              {userEmail}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Calendar size={14} />
              Joined {accountCreationDate}
            </p>
          </div>

          <button
            type="button"
            className="w-full py-2 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Edit profile
          </button>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex">
            <button
              type="button"
              className="flex-1 py-3 flex items-center justify-center gap-2 border-b-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
            >
              <Grid3X3 size={20} />
              <span className="text-xs font-semibold uppercase">Posts</span>
            </button>
            <button
              type="button"
              className="flex-1 py-3 flex items-center justify-center gap-2 border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              <Heart size={20} />
              <span className="text-xs font-semibold uppercase">Liked</span>
            </button>
          </div>
        </div>

        <div className="py-4">
          <MyPosts posts={data.posts} metaData={data._count} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
