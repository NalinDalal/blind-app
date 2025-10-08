// notificationLogic.ts
// Validation logic for creating a notification

export interface NotificationInput {
  userId: string;
  message: string;
  type: string;
}

export interface NotificationResult {
  valid: boolean;
  error?: string;
}

const VALID_TYPES = [
  "COMMENT_LIKE",
  "POST_COMMENT",
  "COMMENT_REPLY",
  "MENTION",
  "SYSTEM",
];

/**
 * Validates the input for creating a notification.
 * - userId, message, and type must be non-empty strings
 * - type must be one of the valid notification types
 */
export function validateNotification(input: NotificationInput): NotificationResult {
  if (!input.userId || !input.message || !input.type) {
    return { valid: false, error: "Missing userId, message, or type" };
  }
  if (!VALID_TYPES.includes(input.type)) {
    return { valid: false, error: "Invalid notification type" };
  }
  return { valid: true };
}
