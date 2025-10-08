// Extracted core logic for comment validation (for testability)
interface ValidateCommentOptions {
  content: string;
  postId: string;
  authorId: string;
  postExists?: boolean;
  userExists?: boolean;
  analyzeToxicity?: (content: string) => { isToxic: boolean };
}

export function validateComment({
  content,
  postId,
  authorId,
  postExists = true,
  userExists = true,
  analyzeToxicity = () => ({ isToxic: false }),
}: ValidateCommentOptions) {
  if (!content || !postId || !authorId) {
    return { ok: false, error: "Missing content, postId, or authorId" };
  }
  if (analyzeToxicity(content).isToxic) {
    return { ok: false, error: "Content flagged as inappropriate. Please revise your comment." };
  }
  if (!postExists) {
    return { ok: false, error: "Post not found" };
  }
  if (!userExists) {
    return { ok: false, error: "User not found" };
  }
  return { ok: true };
}
