import type { CommentWithReplies } from "@/lib/tanstack/types";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: CommentWithReplies[];
  postId: string;
}

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
