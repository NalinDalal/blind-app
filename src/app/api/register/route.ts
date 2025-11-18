import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

const EMAIL_REGEX = /^\w+@oriental\.ac\.in$/i;
const PASSWORD_MIN_LENGTH = 8;

interface RegisterRequest {
  email: string;
  password: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  message: string;
  isVerified: boolean;
}

/**
 * Register a new college user and record an audit log entry.
 *
 * @returns On success, a JSON object with the new user's `id`, `email`, a success `message`, and `isVerified` indicating whether the account is verified; on failure, a JSON object `{ error: string }` describing the problem (returned with an appropriate HTTP status).
 */
export async function POST(req: NextRequest) {
  try {
    let { email, password } = (await req.json()) as RegisterRequest;

    // 1. Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    // Normalize email
    email = email.toLowerCase().trim();

    // Validate email format and domain
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Only college emails (@oriental.ac.in) are allowed." },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
        },
        { status: 400 },
      );
    }

    // Optional: Add password complexity check
    // if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    //   return NextResponse.json(
    //     { error: "Password must contain uppercase, lowercase, and number" },
    //     { status: 400 }
    //   );
    // }

    // 2. Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, verified: true },
    });

    if (existing) {
      // Don't reveal whether user is verified or not
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    // 3. Generate OTP for email verification

    // 4. Create user with transaction
    const user = await prisma.$transaction(async (tx: PrismaClient) => {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          isActive: true,
          loginCount: 0,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          verified: true,
        },
      });

      // Log the registration
      await tx.log.create({
        data: {
          action: "USER_REGISTRATION",
          details: `New user registered: ${email}`,
          userId: newUser.id,
          ipAddress:
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
          level: "INFO",
          category: "AUTH",
        },
      });

      return newUser;
    });

    // 5. Return success response
    return NextResponse.json<RegisterResponse>(
      {
        id: user.id,
        email: user.email,
        message: "Registration successful. Please login.",
        isVerified: user.verified || false,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
