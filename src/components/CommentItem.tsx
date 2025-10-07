"use client";

import { useState } from "react";
import type { CommentWithReplies } from "@/lib/tanstack/types";
import { useAppSelector } from "@/redux/hooks";
import { CommentForm } from "./CommentForm";

interface CommentItemProps {
  comment: CommentWithReplies;
  postId: string;
}

/**
 * Renders a single comment with author, content, an optional reply toggle, and its nested replies.
 *
 * When the user is authenticated, a "Reply" button toggles an embedded CommentForm for submitting a reply.
 * The form automatically hides after a successful submission.
 * Replies are rendered recursively as nested CommentItem components.
 */
export function CommentItem({ comment, postId }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const toggleReply = () => setIsReplying((prev) => !prev);

  return (
    <div className="comment-container mt-3">
      {/* Main comment */}
      <div className="comment-body">
        <p className="text-sm">
          <strong className="font-semibold">
            {comment.author.anonMapping?.anonName || "Anonymous"}
          </strong>
          : {comment.content}
        </p>

        {isAuthenticated && !comment.parentId && (
          <button
            type="button"
            onClick={toggleReply}
            className="text-xs text-gray-500 hover:underline mt-1"
          >
            {isReplying ? "Cancel" : "Reply"}
          </button>
        )}
      </div>

      {/* Reply form */}
      {isReplying && isAuthenticated && (
        <div className="pl-4 mt-2">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={() => setIsReplying(false)}
          />
        </div>
      )}

      {/* Nested replies */}
      {comment.replies?.length > 0 && (
        <div className="replies-container ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4 mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply as CommentWithReplies}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
