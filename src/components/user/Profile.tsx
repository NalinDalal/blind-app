"use client";
import { formatDistanceToNow } from "date-fns";
import { enIN } from "date-fns/locale";
import { motion } from "framer-motion";
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

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // The component now returns a fragment with both the profile and posts sections
  return (
    <>
      <section className="flex items-center space-x-4 p-6 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white">
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Avatar
            seed={userName}
            size={"lg"}
            className="border-2 border-orange-500"
          />
        </motion.div>
        <div className="flex flex-col justify-center">
          <motion.h1
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold"
          >
            {userName}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="text-neutral-600 dark:text-neutral-400 text-base"
          >
            {userEmail}
          </motion.p>
          <motion.p
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="text-neutral-500 dark:text-neutral-300 text-sm mt-1"
          >
            Launched {accountCreationDate}
          </motion.p>
        </div>
      </section>

      {/* Render the MyPosts component below the profile info, passing the posts array */}
      <MyPosts posts={data.posts} metaData={data._count} />
    </>
  );
};

export default Profile;
