// likeCommentLogic.ts
// Validation logic for liking/unliking a comment

export interface LikeCommentInput {
  commentId: string;
  userId: string;
}

export interface LikeCommentResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates the input for liking/unliking a comment.
 * - commentId and userId must be non-empty strings (UUIDs in real use)
 */
export function validateLikeComment(input: LikeCommentInput): LikeCommentResult {
  if (!input.commentId) {
    return { valid: false, error: "Missing commentId" };
  }
  if (!input.userId) {
    return { valid: false, error: "Authentication required" };
  }
  // Could add more checks (UUID format, etc.)
  return { valid: true };
}
