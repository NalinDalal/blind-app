import type { CommentWithReplies } from "@/lib/tanstack/types";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: CommentWithReplies[];
  postId: string;
}

export function CommentList({ comments, postId }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return <p className="text-sm text-muted mt-3">No comments yet. Be the first!</p>;
  }

  return (
    <div className="space-y-4 mt-3">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  );
}
