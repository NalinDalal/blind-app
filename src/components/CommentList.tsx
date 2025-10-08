import type { CommentWithReplies } from "@/lib/tanstack/types";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: CommentWithReplies[];
  postId: string;
}

/**
 * Render a list of comments for a post.
 *
 * Renders a heading and a CommentItem for each entry in `comments`; when `comments` is empty or falsy, renders a "No comments yet." message.
 *
 * @param comments - The comments (with replies) to display in the list
 * @param postId - The identifier of the post these comments belong to
 * @returns A React element containing the comment list or a placeholder message when there are no comments
 */
export function CommentList({ comments, postId }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return <p className="text-sm text-gray-500 mt-4">No comments yet.</p>;
  }

  return (
    <div className="mt-4">
      <h3 className="font-bold">Comments</h3>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  );
}
