export const dynamic = "force-dynamic";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set");
}

// Fake hash for timing attack prevention
const DUMMY_PASSWORD_HASH =
  "$2a$10$invalidhashtopreventtimingattacksXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  id: string;
  email: string;
  anonName: string | null;
  isVerified: boolean;
}

/**
 * Authenticate a user, set a secure HTTP-only JWT cookie, and return basic user information.
 *
 * Expects the request JSON body to include `email` and `password`. Validates input, verifies credentials,
 * enforces account state checks (locked, active, email verified), logs events, and updates login records.
 *
 * @param req - Incoming NextRequest whose JSON body must include `email` and `password`
 * @returns On success, a LoginResponse with `id`, `email`, `anonName`, and `isVerified`. On failure, a JSON error object with an `error` message and an appropriate HTTP status: 400 (bad input), 401 (invalid credentials), 403 (locked/inactive/unverified). When the email is unverified, the response also includes `userId` and `errorCode: "EMAIL_NOT_VERIFIED"`. 500 is returned for unexpected server errors.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    let { email, password } = (await req.json()) as LoginRequest;

    // 1. Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    // Normalize email
    email = email.toLowerCase().trim();

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // 2. Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        anonMapping: true, // Fixed: singular one-to-one
      },
    });

    // 3. Always perform bcrypt comparison to prevent timing attacks
    const passwordHash = user?.password || DUMMY_PASSWORD_HASH;
    const valid = await bcrypt.compare(password, passwordHash);

    // 4. Check credentials
    if (!user || !valid) {
      await prisma.log
        .create({
          data: {
            action: "LOGIN_FAILED",
            details: `Failed login attempt for email: ${email}`,
            ipAddress:
              req.headers.get("x-forwarded-for") ||
              req.headers.get("x-real-ip") ||
              "unknown",
            userAgent: req.headers.get("user-agent") || "unknown",
            level: "WARN",
            category: "AUTH",
          },
        })
        .catch((err: Error | unknown) =>
          console.error("Failed to log login attempt:", err),
        );

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 5. Check if the account is locked
    if (user.isLocked) {
      await prisma.loginLog
        .create({
          data: {
            userId: user.id,
            ipAddress:
              req.headers.get("x-forwarded-for") ||
              req.headers.get("x-real-ip") ||
              "unknown",
            userAgent: req.headers.get("user-agent") || "unknown",
            status: "LOCKED",
          },
        })
        .catch((err: Error | unknown) =>
          console.error("Failed to log locked attempt:", err),
        );

      return NextResponse.json(
        {
          error:
            user.lockedReason || "Account is locked. Please contact support.",
        },
        { status: 403 },
      );
    }

    // 6. Check if the account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is inactive. Please contact support." },
        { status: 403 },
      );
    }

    // 7. Check if email is verified
    if (!user.verified) {
      await prisma.loginLog
        .create({
          data: {
            userId: user.id,
            ipAddress:
              req.headers.get("x-forwarded-for") ||
              req.headers.get("x-real-ip") ||
              "unknown",
            userAgent: req.headers.get("user-agent") || "unknown",
            status: "UNVERIFIED",
          },
        })
        .catch((err: unknown) =>
          console.error("Failed to log unverified attempt:", err),
        );

      return NextResponse.json(
        {
          error: "Please verify your email before logging in.",
          userId: user.id,
          errorCode: "EMAIL_NOT_VERIFIED", // <-- Add this
        },
        {
          status: 403,
        },
      );
    }

    // 8. Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET as string,
      { expiresIn: "2h" },
    );

    // 9. Set secure HTTP-only cookie
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
    });

    // 10. Update user login tracking and logs
    await prisma.$transaction(async (tx: PrismaClient) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          loginCount: { increment: 1 },
        },
      });

      await tx.loginLog.create({
        data: {
          userId: user.id,
          ipAddress:
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
          status: "SUCCESS",
        },
      });

      await tx.log.create({
        data: {
          action: "LOGIN_SUCCESS",
          details: `User logged in: ${email}`,
          userId: user.id,
          ipAddress:
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
          level: "INFO",
          category: "AUTH",
        },
      });
    });
    const anonName = user.anonMapping?.anonName ?? null;

    return NextResponse.json<LoginResponse>(
      {
        id: user.id,
        email: user.email,
        anonName,
        isVerified: user.verified,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
