"use client";

import { useState } from "react";
import { useAddComment } from "@/lib/tanstack/posts";
import { useAppSelector } from "@/redux/hooks";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CommentFormProps {
    postId: string;
    parentId?: string; // Optional: for creating a reply to a specific comment
    onSuccess?: () => void; // Optional: callback to run after a successful submission
}

/**
 * Render a form for creating a comment or reply on a post.
 *
 * @param postId - ID of the post to attach the comment to.
 * @param parentId - Optional ID of the parent comment; when provided the form submits a reply.
 * @param onSuccess - Optional callback invoked after a successful submission.
 * @returns A React element containing the comment input and submit button.
 */
export function CommentForm({ postId, parentId, onSuccess }: CommentFormProps) {
    const [content, setContent] = useState("");
    const { mutate: addComment, isPending } = useAddComment();
    const userId = useAppSelector((state) => state.auth.userId);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!content.trim() || !userId) return;

        addComment(
            { content, postId, authorId: userId, parentId },
            {
                onSuccess: () => {
                    setContent("");
                    onSuccess?.(); // Call the success callback if it exists
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
            <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={parentId ? "Write a reply..." : "Add a comment..."}
                disabled={isPending}
                className="flex-grow"
            />
            <Button type="submit" disabled={isPending} size="sm">
                {isPending ? "..." : "Post"}
            </Button>
        </form>
    );
}