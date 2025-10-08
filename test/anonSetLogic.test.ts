import { validateAnonName } from "./anonSetLogic";

describe("validateAnonName", () => {
  it("returns error if anonName is missing", () => {
    const result = validateAnonName({ anonName: "" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/required/);
  });

  it("returns error if anonName is too short", () => {
    const result = validateAnonName({ anonName: "ab" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/between 3 and 20/);
  });

  it("returns error if anonName is too long", () => {
    const result = validateAnonName({ anonName: "a".repeat(21) });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/between 3 and 20/);
  });

  it("returns error if anonName contains invalid characters", () => {
    const result = validateAnonName({ anonName: "bad name!" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/only contain letters/);
  });

  it("returns error if anonName is reserved", () => {
    const result = validateAnonName({ anonName: "admin" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/reserved/);
  });

  it("returns error if anonName is toxic", () => {
    const result = validateAnonName({
      anonName: "toxicname",
      analyzeToxicity: () => ({ isToxic: true }),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Inappropriate/);
  });

  it("returns ok for valid anonName", () => {
    const result = validateAnonName({ anonName: "valid_name-123" });
    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
