// tokenLogic.ts
// Validation logic for generating a JWT token

export interface TokenInput {
  id: string;
  email: string;
}

export interface TokenResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates the input for generating a JWT token.
 * - id and email must be non-empty strings
 * - email must contain '@' and a dot
 */
export function validateToken(input: TokenInput): TokenResult {
  if (!input.id || !input.email) {
    return { valid: false, error: "id and email required" };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) {
    return { valid: false, error: "Invalid email format" };
  }
  return { valid: true };
}
