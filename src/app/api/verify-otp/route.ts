import { type NextRequest, NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

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
      period: 180, //time period of 3 minutes
    });
    const delta = totp.validate({ token: otp, window: 0 });
    if (delta === null) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 },
      );
    }
    await prisma.user.update({ where: { email }, data: { verified: true } });
    return NextResponse.json({
      message: "OTP verified",
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    console.error(`Failed to verify OTP`, err);
    return NextResponse.json(
      { error: `Failed to verify OTP` },
      { status: 500 },
    );
  }
}
