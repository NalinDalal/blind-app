import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

/**
 * Authenticate a user with email and password and return a JWT plus user information on success.
 *
 * @returns On success (HTTP 200), a JSON object with `token`, `id`, `email`, and `anonName` (`null` if no anon mapping). On client errors: HTTP 400 with `{ error: "Email and password required" }` when fields are missing, or HTTP 401 with `{ error: "Invalid credentials" }` for authentication failures. On unexpected failures: HTTP 500 with `{ error: "Login Failed" }`.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }
    const user = await prisma.user.findUnique({ where: { email } });
    const anonMapping = await prisma.anonMapping.findUnique({
      where: { userId: user?.id },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }
    // Return JWT token for authenticated requests
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h",
    });
    return NextResponse.json(
      {
        token,
        id: user.id,
        email: user.email,
        anonName: anonMapping ? anonMapping.anonName : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Error Login: ${error}`);
    return NextResponse.json({ error: "Login Failed" }, { status: 500 });
  }
}
