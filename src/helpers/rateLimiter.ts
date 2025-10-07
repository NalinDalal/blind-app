/**
 * @fileoverview Rate limiting utility for OTP requests.
 * Provides a global in-memory store to track request timestamps per user.
 * @module helpers/rateLimiter
 */

/**
 * Gets or initializes the global rate limit store.
 * The store maps user identifiers to their last request timestamp.
 *
 * @function getRateLimitStore
 * @returns {Record<string, number>} Map of user identifiers to timestamps (milliseconds)
 *
 * @example
 * const store = getRateLimitStore();
 * const lastRequest = store["user@example.com"];
 * const now = Date.now();
 * const timeSinceLastRequest = now - (lastRequest || 0);
 *
 * if (timeSinceLastRequest < 60000) {
 *   throw new Error("Please wait before requesting another OTP");
 * }
 * store["user@example.com"] = now;
 *
 * @description
 * This is an in-memory store that persists across requests within the same Node.js process.
 * For production environments with multiple instances, consider using Redis or similar.
 *
 * @note This store is global and will be cleared when the server restarts.
 */
export const getRateLimitStore = (): Record<string, number> => {
  if (!global.__otpLastReq) global.__otpLastReq = {};
  return global.__otpLastReq;
};
