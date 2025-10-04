import React from 'react'
import {useInfinitePosts} from "@/lib/tanstack/posts"
import {CommentForm} from "@/components/CommentForm";
import {CommentList} from "@/components/CommentList";

const PostFeed = () => {
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfinitePosts();

    if (status === "pending")
        return <p>Loading...</p>;
    if (status === "error")
        return <p>Error: {error.message}</p>;

    return (
        <section>
            {
                data.pages.map((page, index) => (
                    <React.Fragment key={index}>
                        {page.posts.map((post) => (
                            <div className={"post"} key={post.id}>
                                <p>{post.content}</p>
                                <div className={"post-meta"}>
                                    <span>By: {post.author.anonMapping.anonName || 'Anonymous'}</span>
                                    <span>Comments: {post._count.comments}</span>
                                </div>
                                <CommentForm postId={post.id}/>
                                <CommentList comments={post.comments} postId={post.id}/>
                            </div>
                        ))}
                    </React.Fragment>
                ))
            }
            <div>
                <button
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                >
                    {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : "End of feed"}
                </button>
            </div>
        </section>
    )
}
export default PostFeed
