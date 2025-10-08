import { validateLikeComment } from "./likeCommentLogic";

describe("validateLikeComment", () => {
  it("returns error if commentId is missing", () => {
    const result = validateLikeComment({ commentId: "", userId: "user-1" });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Missing commentId");
  });

  it("returns error if userId is missing", () => {
    const result = validateLikeComment({ commentId: "comment-1", userId: "" });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Authentication required");
  });

  it("returns valid for correct input", () => {
    const result = validateLikeComment({
      commentId: "comment-1",
      userId: "user-1",
    });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
