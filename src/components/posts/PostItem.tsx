"use client";

import React, {useState} from "react";
import {AnimatePresence, motion, type Variants} from "framer-motion";
import type {PostWithDetails} from "@/lib/tanstack/types"; // Adjust this import to your type definitions
import {Avatar} from "./Avatar";
import {CommentForm} from "@/components/comments/CommentForm";
import {CommentList} from "@/components/comments/CommentList";
import {MessageSquare} from "lucide-react"; // npm install lucide-react

interface PostItemProps {
    post: PostWithDetails;
    isAuthenticated: boolean;
}

export const PostItem: React.FC<PostItemProps> = ({post, isAuthenticated}) => {
    const [showComments, setShowComments] = useState(false);
    const authorName = post.author.anonMapping?.anonName ?? "Anonymous";

    // Animation for the post card itself
    const postVariants: Variants = {
        hidden: {y: 20, opacity: 0},
        visible: {y: 0, opacity: 1, transition: {type: "spring", stiffness: 100}},
    };

    // Animation for the collapsible comment section
    const commentsVariants = {
        hidden: {opacity: 0, height: 0},
        visible: {opacity: 1, height: "auto", transition: {duration: 0.3}},
    };

    return (
        <motion.div
            variants={postVariants}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
        >
            <div className="p-6">
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                    <Avatar seed={authorName}/>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{authorName}</span>
                </div>

                {/* Post Content */}
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>

                {/* Meta & Comment Toggle */}
                <div className="mt-4">
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <MessageSquare size={16}/>
                        <span>{post._count.comments} Comments</span>
                    </button>
                </div>
            </div>

            {/* Collapsible Comment Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        variants={commentsVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="border-t border-gray-200 dark:border-gray-700 px-6 pb-4 pt-2"
                    >
                        {isAuthenticated ? (
                            <CommentForm postId={post.id}/>
                        ) : (
                            <p className="text-sm text-gray-500 mt-4">Log in to add a comment.</p>
                        )}
                        <CommentList comments={post.comments} postId={post.id}/>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};