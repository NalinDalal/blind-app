// Extracted core logic for post validation (for testability)
interface ValidatePostOptions {
  content: string;
  authorId: string;
  college: string;
  analyzeToxicity?: (content: string) => { isToxic: boolean };
}

export function validatePost({
  content,
  authorId,
  college,
  analyzeToxicity = (content: string) => ({ isToxic: false }),
}: ValidatePostOptions) {
  if (!content || !authorId || !college) {
    return { ok: false, error: "Missing content, authorId, or college" };
  }
  if (analyzeToxicity(content).isToxic) {
    return { ok: false, error: "Content flagged as toxic/abusive. Please revise your post." };
  }
  return { ok: true };
}
