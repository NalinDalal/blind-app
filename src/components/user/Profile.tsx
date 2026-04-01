"use client";

import { formatDistanceToNow } from "date-fns";
import { enIN } from "date-fns/locale";
import {
  Calendar,
  Edit,
  Grid3X3,
  Heart,
  MessageCircle,
  Settings,
  User,
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
        <Loader text={"Loading..."} />
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
    <div className="min-h-screen">
      <div className="px-4 pt-6 pb-8">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <Avatar
              seed={userName}
              size={"lg"}
              className="h-24 w-24 ring-2 ring-[rgb(var(--accent))]"
            />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[rgb(var(--background))]" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {userName}
          </h1>
          <p className="text-sm text-muted">{accountCreationDate}</p>
        </div>

        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold font-[family-name:var(--font-space-mono)] text-foreground">
              {posts}
            </p>
            <p className="text-xs text-muted uppercase tracking-wider">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-[family-name:var(--font-space-mono)] text-foreground">
              {likes}
            </p>
            <p className="text-xs text-muted uppercase tracking-wider">Likes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-[family-name:var(--font-space-mono)] text-foreground">
              {comments}
            </p>
            <p className="text-xs text-muted uppercase tracking-wider">
              Comments
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-subtle mb-6">
          <div className="flex items-center gap-2 mb-2">
            <User size={14} className="text-muted" />
            <span className="text-sm text-muted">{userEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted" />
            <span className="text-sm text-muted">
              Joined {accountCreationDate}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="w-full py-3 px-4 bg-surface hover:bg-surface-elevated text-foreground font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-subtle"
        >
          <Edit size={16} />
          Edit Profile
        </button>
      </div>

      <div className="border-t border-subtle">
        <div className="flex">
          <button
            type="button"
            className="flex-1 py-4 flex items-center justify-center gap-2 border-b-2 border-[rgb(var(--accent))] text-foreground"
          >
            <Grid3X3 size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Posts
            </span>
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        <MyPosts posts={data.posts} metaData={data._count} />
      </div>
    </div>
  );
};

export default Profile;
