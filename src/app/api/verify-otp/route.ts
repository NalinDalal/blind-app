import { type NextRequest, NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

/**
 * Handle POST requests to verify a user's time-based one-time password (OTP) and mark the user as verified.
 *
 * @param req - Incoming NextRequest whose JSON body must include `email` and `otp` string fields.
 * @returns On success: a JSON object with `message` set to "OTP verified", `id` (user id), `email`, and `anonName` (string or `null`). On failure: a JSON object with an `error` message and an appropriate HTTP status (400, 401, or 500).
 */
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp)
      return NextResponse.json(
        { error: "Email and OTP required" },
        { status: 400 },
      );

    const user = await prisma.user.findUnique({ where: { email } });
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

    if (!user.otp) {
      return NextResponse.json(
        { error: "OTP secret not set for user" },
        { status: 400 },
      );
    }
    const totp = new OTPAuth.TOTP({
      issuer: "BlindApp",
      label: email,
      secret: OTPAuth.Secret.fromBase32(user.otp),
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
    await prisma.user.update({ where: { email }, data: { verified: true } });
    const anonMap = await prisma.anonMapping.findUnique({
      where: { userId: user.id },
    });
    return NextResponse.json({
      message: "OTP verified",
      id: user.id,
      email: user.email,
      anonName: anonMap ? anonMap.anonName : null,
    });
  } catch (err) {
    console.error(`Failed to verify OTP`, err);
    return NextResponse.json(
      { error: `Failed to verify OTP` },
      { status: 500 },
    );
  }
}
