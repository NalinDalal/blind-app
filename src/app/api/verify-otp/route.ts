import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import { getOrCreateSecret } from "@/helpers/otpSecret";
import { prisma } from "@/lib/prisma";

const JWT_SECRET =
  process.env.JWT_SECRET ??
  (process.env.NODE_ENV === "development" ? "devsecret" : undefined);

/**
 * Verify a user's TOTP, mark the user verified, set an authentication cookie, and return basic user info.
 *
 * @param req - NextRequest whose JSON body must include `email` and `otp`
 * @returns On success: an object with `message: "OTP verified"`, `id`, `email`, and `anonName` (or `null`). On failure: an object with an `error` message and an appropriate HTTP status code (`400` for missing/invalid input, `401` for not found or invalid/expired OTP, `500` for server errors).
 */
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp)
      return NextResponse.json(
        { error: "Email and OTP required" },
        { status: 400 },
      );

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        anonMapping: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Ensure the secret is a non-empty string before proceeding
    if (typeof user.otp !== "string" || user.otp.length === 0) {
      return NextResponse.json(
        { error: "Invalid OTP secret format" },
        { status: 400 },
      );
    }

    const secret = await getOrCreateSecret(user.email);
    const totp = new OTPAuth.TOTP({
      issuer: "BlindApp",
      label: email,
      secret,
      digits: 6,
      period: 120,
    });
    const delta = totp.validate({ token: otp, window: 0 });
    if (delta === null) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 },
      );
    }
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { verified: true },
      select: {
        verified: true,
      },
    });

    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 },
      );
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "2h",
    });

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 2,
    });

    const anonName = user.anonMapping?.anonName ?? null;

    return NextResponse.json({
      message: "OTP verified",
      id: user.id,
      email: user.email,
      anonName,
      isVerified: updatedUser.verified,
    });
  } catch (err) {
    console.error(`Failed to verify OTP`, err);
    return NextResponse.json(
      { error: `Failed to verify OTP` },
      { status: 500 },
    );
  }
}
