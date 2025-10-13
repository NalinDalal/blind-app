import type { CommentWithReplies } from "@/lib/tanstack/types";
import { CommentItem } from "./CommentItem"; // We will create this next

interface CommentListProps {
  comments: CommentWithReplies[];
  postId: string;
}

export function CommentList({ comments, postId }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return <p className="text-sm text-gray-500 mt-4">No comments yet.</p>;
  }

  return (
      <div className="space-y-4 mt-4">
        {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>
  );
}