import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { analyzeToxicity } from "@/helpers/contentModeration";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

// Use a default during build/dev to avoid throwing at module evaluation.
// In production, ensure JWT_SECRET is set in the environment.
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

interface JWTPayload {
  id: string;
}

const RESERVED_NAMES = ["admin", "moderator", "system", "anonymous", "deleted"];
const ANON_NAME_MIN_LENGTH = 3;
const ANON_NAME_MAX_LENGTH = 20;
const ANON_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Handles POST requests to set an anonymous display name for a user.
 *
 * This endpoint allows an authenticated user to set a unique, non-reserved, and non-toxic anonymous name (anonName).
 * The anonName is mapped to the user's account and cannot be changed once set. The handler performs validation on the
 * anonName, checks for reserved words, enforces length and character rules, and ensures the name is not already taken.
 * It also verifies the user's JWT token and checks for inappropriate content using a toxicity filter.
 *
 * Request body:
 *   - anonName: string (required) — The desired anonymous name.
 *
 * Authentication:
 *   - Requires a valid JWT token in the 'token' cookie.
 *
 * Returns:
 *   - 201: { anonName } on success
 *   - 400: { error } if input is invalid or missing
 *   - 401: { error } if token is invalid or expired
 *   - 403: { error } if user already set an anonName
 *   - 409: { error } if anonName is already taken
 *   - 500: { error } for internal server errors
 *
 * @param {NextRequest} req - The incoming Next.js request object containing JSON body and cookies.
 * @returns {Promise<NextResponse>} The response with status and result or error message.
 *
 * @example
 * // Request body: { "anonName": "cool_user123" }
 * // Response: { "anonName": "cool_user123" }
 */
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // 1. Extract and validate input
    const { anonName } = await req.json();
    const cookieStore = await cookies();
    const auth = cookieStore.get("token")?.value;

    if (!anonName || !auth) {
      return NextResponse.json(
        { error: "anonName and Authorization token required" },
        { status: 400 },
      );
    }

    // 2. Validate anonName format
    if (
      anonName.length < ANON_NAME_MIN_LENGTH ||
      anonName.length > ANON_NAME_MAX_LENGTH
    ) {
      return NextResponse.json(
        {
          error: `anonName must be between ${ANON_NAME_MIN_LENGTH} and ${ANON_NAME_MAX_LENGTH} characters`,
        },
        { status: 400 },
      );
    }

    if (!ANON_NAME_REGEX.test(anonName)) {
      return NextResponse.json(
        {
          error:
            "anonName can only contain letters, numbers, underscores, and hyphens",
        },
        { status: 400 },
      );
    }

    if (RESERVED_NAMES.includes(anonName.toLowerCase())) {
      return NextResponse.json(
        { error: "This anonName is reserved" },
        { status: 400 },
      );
    }

    // 3. Toxicity check
    const toxicityResult = analyzeToxicity(anonName);
    if (toxicityResult.isToxic) {
      return NextResponse.json(
        { error: "Inappropriate anonName" },
        { status: 400 },
      );
    }

    // 4. Verify JWT
    let userId: string;
    try {
      const decoded = jwt.verify(auth, JWT_SECRET) as JWTPayload;
      userId = decoded.id;
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // 5. Create mapping within transaction
    const mapping = await prisma.$transaction(
      async (tx: PrismaClient) => {
        // Check if user already has an anonName (should check first)
        const existingUser = await tx.anonMapping.findUnique({
          where: { userId },
        });

        if (existingUser) {
          throw new Error("ANON_NAME_ALREADY_SET");
        }

        // Check if anonName is taken
        const existingName = await tx.anonMapping.findUnique({
          where: { anonName },
        });

        if (existingName) {
          throw new Error("ANON_NAME_TAKEN");
        }

        // Create the mapping
        return tx.anonMapping.create({
          data: { userId, anonName },
        });
      },
      {
        maxWait: 10000, // Wait for 10 seconds for a connection
        timeout: 15000, // Allow the transaction 15 seconds to complete
      },
    );

    return NextResponse.json({ anonName: mapping.anonName }, { status: 201 });
  } catch (error) {
    // Handle custom errors
    if (error instanceof Error) {
      if (error.message === "ANON_NAME_ALREADY_SET") {
        return NextResponse.json(
          {
            error: "You have already set your anon name and cannot change it.",
          },
          { status: 403 },
        );
      }
      if (error.message === "ANON_NAME_TAKEN") {
        return NextResponse.json(
          { error: "anonName already taken" },
          { status: 409 },
        );
      }
    }

    // Handle Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "anonName already taken" },
          { status: 409 },
        );
      }
    }

    console.error("Failed to set Anon Name:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
