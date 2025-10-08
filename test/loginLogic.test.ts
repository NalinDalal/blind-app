import { validateLogin } from "./loginLogic";

describe("validateLogin", () => {
  it("returns error if email is missing", () => {
    const result = validateLogin({ email: "", password: "pass" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/required/);
  });

  it("returns error if password is missing", () => {
    const result = validateLogin({ email: "user@example.com", password: "" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/required/);
  });

  it("returns error if email format is invalid", () => {
    const result = validateLogin({ email: "bademail", password: "pass" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Invalid email format/);
  });

  it("returns ok for valid email and password", () => {
    const result = validateLogin({
      email: "user@example.com",
      password: "pass",
    });
    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
