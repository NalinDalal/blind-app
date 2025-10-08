import { validateToken } from "./tokenLogic";

describe("validateToken", () => {
  it("returns error if id is missing", () => {
    const result = validateToken({ id: "", email: "student@oriental.ac.in" });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("id and email required");
  });

  it("returns error if email is missing", () => {
    const result = validateToken({ id: "user_123", email: "" });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("id and email required");
  });

  it("returns error if email is invalid", () => {
    const result = validateToken({ id: "user_123", email: "notanemail" });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid email format");
  });

  it("returns valid for correct input", () => {
    const result = validateToken({ id: "user_123", email: "student@oriental.ac.in" });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
