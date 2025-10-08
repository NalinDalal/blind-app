import { validatePost } from "./postLogic";

describe("validatePost", () => {
  it("returns error if content is missing", () => {
    const result = validatePost({ content: "", authorId: "u1", college: "c1" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Missing content/);
  });

  it("returns error if authorId is missing", () => {
    const result = validatePost({ content: "hi", authorId: "", college: "c1" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Missing content/);
  });

  it("returns error if college is missing", () => {
    const result = validatePost({ content: "hi", authorId: "u1", college: "" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Missing content/);
  });

  it("returns error if content is toxic", () => {
    const result = validatePost({
      content: "bad stuff",
      authorId: "u1",
      college: "c1",
      analyzeToxicity: () => ({ isToxic: true }),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/toxic/);
  });

  it("returns ok for valid post", () => {
    const result = validatePost({ content: "This is a valid post.", authorId: "u1", college: "c1" });
    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
