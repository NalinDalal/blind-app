/**
 * @fileoverview API route for generating JWT authentication tokens.
 * Validates user credentials and issues time-limited access tokens.
 * @module api/token
 */
import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * JWT secret key for token signing.
 * Falls back to "devsecret" for development environments.
 * @constant {string}
 */
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

/**
 * POST endpoint to generate a JWT token for authenticated users.
 * Validates user existence and issues a token with 2-hour expiration.
 *
 * @async
 * @function POST
 * @param {NextRequest} req - The incoming Next.js request object
 * @returns {Promise<NextResponse>} JSON response with the generated token or error
 *
 * @example
 * // Request body
 * // {
 * //   "id": "user_123",
 * //   "email": "student@oriental.ac.in"
 * // }
 *
 * @example
 * // Success response (200)
 * // {
 * //   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * // }
 *
 * @example
 * // Error response (400)
 * // {
 * //   "error": "User doesn't exist"
 * // }
 *
 * @throws {400} Missing id or email in request body
 * @throws {400} User with given email doesn't exist
 * @throws {500} Token generation or database query failure
 */
export async function POST(req: NextRequest) {
  try {
    const { id, email } = await req.json();
    if (!id || !email) {
      return NextResponse.json(
        { error: "id and email required" },
        { status: 400 },
      );
    }
    // Optionally: check user exists

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (!userExists) {
      return NextResponse.json(
        { error: "User doesn't exist" },
        { status: 400 },
      );
    }

    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: "2h" });
    return NextResponse.json({ token });
  } catch (err) {
    console.error(`Failed to generate token`, err);
    return NextResponse.json(
      { error: `Failed to generate token` },
      { status: 500 },
    );
  }
}
