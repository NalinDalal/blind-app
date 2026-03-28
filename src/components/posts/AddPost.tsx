"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import { getStudentDetailsFromEmail } from "@/helpers/studentDetails";
import { useCreatePost, useUserProfile } from "@/lib/tanstack/user";
import { useAppSelector } from "@/redux/hooks";
import { Avatar } from "./Avatar";

const AddPost = () => {
  const { userId } = useAppSelector((state) => state.auth);
  const { data } = useUserProfile(userId || "");
  const { mutate: createPost, isPending } = useCreatePost(userId || "");
  const [postText, setPostText] = useState("");

  const handlePost = () => {
    try {
      if (!userId || !data?.email) {
        toast.error("Please login to post");
        return;
      }
      if (!postText.trim()) {
        toast.error("Please enter a post");
        return;
      }
      const college =
        getStudentDetailsFromEmail(data?.email)?.collegeName ||
        "Oriental Group of Institutes";
      createPost(
        {
          content: postText,
          authorId: userId,
          college,
        },
        {
          onSuccess: () => setPostText(""),
        },
      );
      setPostText("");
    } catch (e) {
      toast.error("Something went wrong");
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-4"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 pt-1">
          <Avatar
            seed={data?.anonMapping?.anonName || "Anonymous"}
            className="h-10 w-10"
          />
        </div>

        <div className="flex-1 min-w-0">
          <TextareaAutosize
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Start a post..."
            className="w-full text-base bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 leading-relaxed"
            minRows={1}
            maxRows={10}
          />

          {postText.trim() && (
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-2">
              <button
                type="button"
                className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                <ImageIcon size={20} />
              </button>

              <button
                type="button"
                onClick={handlePost}
                disabled={!postText.trim() || isPending}
                className="
                  flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm
                  bg-blue-500 hover:bg-blue-600 text-white
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                <Send size={16} />
                Post
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AddPost;
