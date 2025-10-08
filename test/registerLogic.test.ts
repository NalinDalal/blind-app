import { validateRegister } from "./registerLogic";

describe("validateRegister", () => {
  it("returns error if email is missing", () => {
    const result = validateRegister({ email: "", password: "password123" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/required/);
  });

  it("returns error if password is missing", () => {
    const result = validateRegister({
      email: "user@oriental.ac.in",
      password: "",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/required/);
  });

  it("returns error if email is not college domain", () => {
    const result = validateRegister({
      email: "user@gmail.com",
      password: "password123",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/college emails/);
  });

  it("returns error if password is too short", () => {
    const result = validateRegister({
      email: "user@oriental.ac.in",
      password: "short",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/at least 8/);
  });

  it("returns ok for valid email and password", () => {
    const result = validateRegister({
      email: "user@oriental.ac.in",
      password: "password123",
    });
    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
