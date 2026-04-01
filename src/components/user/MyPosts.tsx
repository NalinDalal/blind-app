import type React from "react";
import type { Post } from "@/../generated/prisma/client";

interface UserMetaData {
  posts: number;
  comments: number;
  notifications: number;
  commentLikes: number;
  loginLogs: number;
}

interface PostWithCount extends Post {
  _count: {
    comments: number;
    votes: number;
  };
}

interface MyPostsProps {
  posts: PostWithCount[];
  metaData: UserMetaData;
}

const MyPosts: React.FC<MyPostsProps> = ({ posts, metaData }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-surface flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            role="img"
            aria-label="No posts"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>
        </div>
        <p className="text-foreground font-semibold mb-1">
          No posts yet
        </p>
        <p className="text-sm text-muted">
          Share your first post with the world!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <div
          key={post.id}
          className="aspect-square bg-surface relative group cursor-pointer overflow-hidden rounded-lg"
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-void/80 backdrop-blur-sm transition-opacity">
            <div className="flex items-center gap-4 text-foreground">
              <span className="flex items-center gap-1 font-semibold font-[family-name:var(--font-space-mono)]">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Votes"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {post._count.votes}
              </span>
              <span className="flex items-center gap-1 font-semibold font-[family-name:var(--font-space-mono)]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Comments"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {post._count.comments}
              </span>
            </div>
          </div>
          {post.content.length > 50 ? (
            <p className="text-xs text-muted p-2 truncate">
              {post.content.substring(0, 50)}...
            </p>
          ) : (
            <p className="text-xs text-muted p-2">
              {post.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyPosts;
