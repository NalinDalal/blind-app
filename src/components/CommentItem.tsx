"use client";

import { useState } from "react";
import type { CommentWithReplies } from "@/lib/tanstack/types";
import { CommentForm } from "./CommentForm";
import {useAppSelector} from "@/redux/hooks";

interface CommentItemProps {
    comment: CommentWithReplies;
    postId: string;
}

/**
 * Renders a single comment with author, content, an optional reply toggle, and its nested replies.
 *
 * When the user is authenticated, a "Reply" button toggles an embedded CommentForm for submitting a reply;
 * the form is hidden after a successful submission. Replies are rendered recursively as nested CommentItem components.
 *
 * @param comment - The comment to render, including its nested replies.
 * @param postId - Identifier of the post to which the comment belongs (passed to reply forms).
 * @returns The JSX element for the comment item and its nested replies.
 */
export function CommentItem({ comment, postId }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const {isAuthenticated} = useAppSelector(state=>state.auth)

    return (
        <div className="comment-container mt-3">
            {/* Render the main comment body */}
            <div className="comment-body">
                <p className="text-sm">
                    <strong className="font-semibold">{comment.author.anonMapping?.anonName || "Anonymous"}</strong>
                    : {comment.content}
                </p>

                {isAuthenticated && (
                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="text-xs text-gray-500 hover:underline mt-1"
                    >
                        {isReplying ? 'Cancel' : 'Reply'}
                    </button>
                )}
            </div>

            {/* Conditionally render the reply form */}
            {isReplying && isAuthenticated && (
                <div className="pl-4">
                    <CommentForm
                        postId={postId}
                        parentId={comment.id}
                        onSuccess={() => setIsReplying(false)} // Hide form on success
                    />
                </div>
            )}

            {/* Recursively render replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="replies-container ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4 mt-2">
                    {comment.replies.map((reply) => (
                        <CommentItem key={reply.id} comment={reply as CommentWithReplies} postId={postId} />
                    ))}
                </div>
            )}
        </div>
    );
}