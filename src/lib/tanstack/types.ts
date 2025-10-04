import type { Post, Comment } from "@/generated/prisma";

// Type for the author's anonymous details
export type AuthorDetails = {
    anonMapping: { anonName: string };
};

// A comment that includes its author details and a list of its own replies
export type CommentWithReplies = Comment & {
    author: AuthorDetails;
    replies: (Comment & { author: AuthorDetails })[];
};

// A post that includes its author, comment count, and a list of top-level comments
export type PostWithDetails = Post & {
    author: AuthorDetails;
    _count: {
        comments: number;
    };
    comments: CommentWithReplies[];
};

// The full API response for the infinite query
export type InfinitePostsData = {
    posts: PostWithDetails[];
    nextCursor: string | null;
};

// The payload for creating a new comment
export type NewCommentPayload = {
    content: string;
    postId: string;
    authorId: string;
    parentId?: string;
};