import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

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
}

/**
 * Handle user registration for college accounts and create a new user record.
 *
 * Validates the request body for an email and password, enforces the college email domain and minimum password length, ensures the user does not already exist, hashes the password, creates the user and an audit log, and returns a JSON response describing the result.
 *
 * @returns A NextResponse whose JSON payload is either:
 * - a RegisterResponse object with `id`, `email`, and `message` on success (HTTP 201), or
 * - an error object `{ error: string }` with an appropriate HTTP status for validation errors (400), conflict when the user exists (409), or server errors (500).
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
    const user = await prisma.$transaction(async (tx) => {
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
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // Unique constraint violation (shouldn't happen due to pre-check, but just in case)
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
