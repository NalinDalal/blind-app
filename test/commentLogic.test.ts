import { validateComment } from "./commentLogic";

describe("validateComment", () => {
  it("returns error if content is missing", () => {
    const result = validateComment({
      content: "",
      postId: "p1",
      authorId: "u1",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Missing content/);
  });

  it("returns error if postId is missing", () => {
    const result = validateComment({
      content: "hi",
      postId: "",
      authorId: "u1",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Missing content/);
  });

  it("returns error if authorId is missing", () => {
    const result = validateComment({
      content: "hi",
      postId: "p1",
      authorId: "",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Missing content/);
  });

  it("returns error if content is toxic", () => {
    const result = validateComment({
      content: "bad stuff",
      postId: "p1",
      authorId: "u1",
      analyzeToxicity: () => ({ isToxic: true }),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/inappropriate/);
  });

  it("returns error if post does not exist", () => {
    const result = validateComment({
      content: "hi",
      postId: "p1",
      authorId: "u1",
      postExists: false,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Post not found/);
  });

  it("returns error if user does not exist", () => {
    const result = validateComment({
      content: "hi",
      postId: "p1",
      authorId: "u1",
      userExists: false,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/User not found/);
  });

  it("returns ok for valid comment", () => {
    const result = validateComment({
      content: "This is a valid comment.",
      postId: "p1",
      authorId: "u1",
    });
    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
