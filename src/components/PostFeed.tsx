import React from "react";
import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { useInfinitePosts } from "@/lib/tanstack/posts";
import { useAppSelector } from "@/redux/hooks";

const PostFeed = () => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfinitePosts();

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (status === "pending") return <p>Loading...</p>;
  if (status === "error") return <p>Error: {error.message}</p>;

  return (
    <section>
      {data.pages.map((page, index) => (
        <React.Fragment key={index}>
          {page.posts.map((post) => (
            <div className={"post"} key={post.id}>
              <p>{post.content}</p>
              <div className={"post-meta"}>
                <span>
                  By: {post.author.anonMapping.anonName ?? "Anonymous"}
                </span>
                <span>Comments: {post._count.comments}</span>
              </div>
              {isAuthenticated ? (
                <CommentForm postId={post.id} />
              ) : (
                <p className="text-sm text-gray-500 mt-4">
                  Log in to add a comment.
                </p>
              )}
              <CommentList comments={post.comments} postId={post.id} />
            </div>
          ))}
        </React.Fragment>
      ))}
      <div>
        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
              ? "Load More"
              : "End of feed"}
        </button>
      </div>
    </section>
  );
};
export default PostFeed;
