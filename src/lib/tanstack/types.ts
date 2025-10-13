import type {
  Comment,
  CommentLike,
  LoginLog,
  Notification,
  Post,
} from "@/generated/prisma";

// Type for the author's anonymous details
export type AuthorDetails = {
  anonMapping: { anonName: string };
};

// A comment that includes its author details and a list of its own replies
export type CommentWithReplies = Comment & {
  author: AuthorDetails;
  // This is the key change: a reply is also a 'CommentWithReplies'
  replies: CommentWithReplies[];
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

// user tanstack section

export interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  verified: boolean;
  verifiedAt: string;
  isActive: boolean;
  isLocked: boolean;
  lockedAt: string | null;
  lockedReason: string | null;
  lastLogin: string;
  loginCount: number;
  anonMapping: {
    anonName: string;
  } | null;
  posts: Post[];
  comments: Comment[];
  commentLikes: CommentLike[];
  notifications: Notification[];
  loginLogs: LoginLog[];
  _count: {
    posts: number;
    comments: number;
    notifications: number;
    commentLikes: number;
    loginLogs: number;
  };
}

export interface NewPostPayload {
  content: string;
  authorId: string;
  collage: string;
}
