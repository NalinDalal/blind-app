import { validateNotification } from "./notificationLogic";

describe("validateNotification", () => {
  it("returns error if userId is missing", () => {
    const result = validateNotification({
      userId: "",
      message: "msg",
      type: "COMMENT_LIKE",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Missing userId, message, or type");
  });

  it("returns error if message is missing", () => {
    const result = validateNotification({
      userId: "u1",
      message: "",
      type: "COMMENT_LIKE",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Missing userId, message, or type");
  });

  it("returns error if type is missing", () => {
    const result = validateNotification({
      userId: "u1",
      message: "msg",
      type: "",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Missing userId, message, or type");
  });

  it("returns error if type is invalid", () => {
    const result = validateNotification({
      userId: "u1",
      message: "msg",
      type: "INVALID",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid notification type");
  });

  it("returns valid for correct input", () => {
    const result = validateNotification({
      userId: "u1",
      message: "msg",
      type: "COMMENT_LIKE",
    });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
