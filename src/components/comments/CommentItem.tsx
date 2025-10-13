"use client";

import React, {useState} from "react";
import {motion} from "framer-motion";
import type {CommentWithReplies} from "@/lib/tanstack/types";
import {Avatar} from "@/components/posts/Avatar";
import {CommentForm} from "./CommentForm";
import {CommentList} from "./CommentList";

interface CommentItemProps {
    comment: CommentWithReplies;
    postId: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({comment, postId}) => {
    const [isReplying, setIsReplying] = useState(false);
    const authorName = comment.author.anonMapping?.anonName ?? "Anonymous";

    // Simple fade-in for new comments
    const commentVariants = {
        hidden: {opacity: 0, x: -10},
        visible: {opacity: 1, x: 0},
    };

    return (
        <motion.div
            variants={commentVariants}
            initial="hidden"
            animate="visible"
            transition={{duration: 0.3}}
            className="flex flex-col"
        >
            <div className="flex items-start gap-3">
                <Avatar seed={authorName} className="h-8 w-8 mt-1"/>
                <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{authorName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{comment.content}</p>
                    </div>
                    {!comment.parentId && <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="text-xs font-semibold text-gray-500 hover:text-blue-600 mt-1 px-1"
                    >
                        Reply
                    </button>}
                </div>
            </div>

            {/* Nested Replies & Reply Form */}
            <div className="pl-8 mt-2 border-l-2 border-gray-200 dark:border-gray-600 ml-5">
                {isReplying && (
                    <CommentForm
                        postId={postId}
                        parentId={comment.id}
                        onSuccess={() => setIsReplying(false)}
                    />
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <CommentList comments={comment.replies} postId={postId}/>
                )}
            </div>
        </motion.div>
    );
};