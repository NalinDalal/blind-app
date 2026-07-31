// helpers/auth/token.ts
import jwt, { type JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set");
}

/**
 * Decodes and verifies a JWT token.
 * @param token - The JWT token string
 * @returns The decoded payload if valid, otherwise null
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as JwtPayload;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}
