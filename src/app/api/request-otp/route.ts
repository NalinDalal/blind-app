import { type NextRequest, NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import { getOrCreateSecret } from "@/helpers/otpSecret";
import { getRateLimitStore } from "@/helpers/rateLimiter";
import { sendEmail } from "@/utils/sendEmail";

declare global {
  // A record mapping email strings to the last OTP request timestamp
  var __otpLastReq: Record<string, number> | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    // Only allow emails from @oriental.ac.in
    if (!/^\w+@oriental\.ac\.in$/i.test(email)) {
      return NextResponse.json(
        { error: "Only college emails (@oriental.ac.in) are allowed." },
        { status: 400 },
      );
    }

    const store = getRateLimitStore();
    const now = Date.now();
    if (!store[email]) store[email] = 0;

    if (now - store[email] < 30 * 1000) {
      return NextResponse.json(
        { error: "Please wait before requesting another OTP." },
        { status: 409 },
      );
    }

    store[email] = now;

    const secret = await getOrCreateSecret(email);
    const totp = new OTPAuth.TOTP({
      issuer: "BlindApp",
      label: email,
      secret,
      digits: 6,
      period: 120,
    });
    const otp = totp.generate();

    try {
      const html = `
      <div style="font-family:Arial,sans-serif;max-width:400px;margin:2rem auto;padding:2rem;border-radius:10px;background:#f9f9f9;border:1px solid #eee;">
        <h2 style="color:#2d3748;">Your Blind App OTP</h2>
        <p style="font-size:1.1em;">Use the following code to verify your login. This code is valid for <b>2 minutes</b>:</p>
        <div style="font-size:2em;font-weight:bold;letter-spacing:0.2em;background:#fff;padding:1em 0;margin:1em 0;border-radius:8px;border:1px dashed #2d3748;color:#2d3748;text-align:center;">${otp}</div>
        <p style="font-size:0.95em;color:#555;">If you did not request this, you can safely ignore this email.</p>
        <div style="margin-top:2em;font-size:0.9em;color:#888;">&mdash; Blind App Team</div>
      </div>
    `;
      await sendEmail(
        email,
        "Your OTP Code for Blind App",
        `Your OTP is: ${otp}\nIt is valid for 2 minutes.`,
        html,
      );
    } catch (e: unknown) {
      if (e instanceof Error) console.error(`error sending Mail: ${e.message}`);
      console.error(`error sending Mail: ${e}`);
      return NextResponse.json(
        { error: "Failed to send OTP email." },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error(`Internal Server Error`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
