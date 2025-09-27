// Helper to get a global store for rate limiting
export const getRateLimitStore = (): Record<string, number> => {
  if (!global.__otpLastReq) global.__otpLastReq = {};
  return global.__otpLastReq;
};
