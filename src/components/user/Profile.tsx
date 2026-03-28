"use client";

import { formatDistanceToNow } from "date-fns";
import { enIN } from "date-fns/locale";
import { motion } from "framer-motion";
import { Calendar, MessageCircle, ThumbsUp, User } from "lucide-react";
import { Avatar } from "@/components/posts/Avatar";
import ErrorFallback from "@/components/ui/ErrorFallback";
import Loader from "@/components/ui/Loader";
import { useUserProfile } from "@/lib/tanstack/user";
import { useAppSelector } from "@/redux/hooks";
import MyPosts from "./MyPosts";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  index: number;
}

const StatCard = ({ icon, label, value, index }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 * (index + 1), duration: 0.3 }}
    className="flex items-center gap-4 p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group"
  >
    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </motion.div>
);

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

  const stats = [
    {
      icon: <MessageCircle size={22} />,
      label: "Posts",
      value: data._count?.posts || 0,
    },
    {
      icon: <ThumbsUp size={22} />,
      label: "Likes",
      value: data._count?.commentLikes || 0,
    },
    {
      icon: <Calendar size={22} />,
      label: "Days Active",
      value:
        Math.floor(
          (Date.now() - new Date(data?.createdAt || Date.now()).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1,
    },
  ];

  return (
    <div className="min-h-screen bg-mesh pb-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-3s" }}
        />

        <div className="relative container mx-auto px-4 sm:px-6 pt-8 pb-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse" />
              <Avatar
                seed={userName}
                size={"lg"}
                className="relative ring-4 ring-white dark:ring-gray-800 shadow-xl"
              />
              <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-gray-900" />
            </div>

            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2"
            >
              {userName}
            </motion.h1>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1"
            >
              <User size={16} />
              {userEmail}
            </motion.p>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-400 dark:text-gray-500"
            >
              Member since {accountCreationDate}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl" />
          <div className="relative">
            <MyPosts posts={data.posts} metaData={data._count} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
