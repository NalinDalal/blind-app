"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
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

  const isEmpty = !postText.trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 rounded-2xl bg-surface border border-subtle"
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
            onFocus={() => setIsFocused(true)}
            placeholder="Share something anonymously..."
            className="w-full text-base bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-foreground placeholder:text-muted leading-relaxed"
            minRows={1}
            maxRows={10}
          />

          {isFocused && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between pt-3 mt-3 border-t border-subtle"
            >
              <span className="text-xs text-muted">
                {postText.length > 0 && `${postText.length} characters`}
              </span>

              <button
                type="button"
                onClick={handlePost}
                disabled={isEmpty || isPending}
                className="
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
                  bg-foreground text-[rgb(var(--background))]
                  hover:bg-foreground/90
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-200
                  active:scale-[0.98]
                "
              >
                <Send size={16} />
                Post
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AddPost;
