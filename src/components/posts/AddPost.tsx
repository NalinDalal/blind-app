"use client";

import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
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
  const [isFocused, setIsFocused] = useState(false);

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
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div
        className={`
        relative overflow-hidden rounded-2xl border transition-all duration-300
        ${
          isFocused
            ? "border-indigo-500/50 dark:border-indigo-500/50 bg-white/90 dark:bg-gray-900/90 shadow-lg shadow-indigo-500/10"
            : "border-gray-200/60 dark:border-gray-700/40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm"
        }
      `}
      >
        <div className="p-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar
                  seed={data?.anonMapping?.anonName || "Anonymous"}
                  className="ring-2 ring-indigo-500/20"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <TextareaAutosize
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Share your thoughts with the community..."
                className="w-full text-base sm:text-lg bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 leading-relaxed"
                minRows={2}
                maxRows={12}
              />

              <div
                className={`flex items-center justify-between mt-3 pt-3 border-t transition-opacity duration-300 ${postText.trim() ? "opacity-100" : "opacity-0"}`}
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-500 transition-colors"
                    title="Add emoji"
                  >
                    <Sparkles size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {postText.trim() && (
                    <span className="text-xs text-gray-400">
                      {postText.length} characters
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handlePost}
                    disabled={!postText.trim() || isPending}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm
                      transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        postText.trim()
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      }
                    `}
                  >
                    {isPending ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Post</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AddPost;
