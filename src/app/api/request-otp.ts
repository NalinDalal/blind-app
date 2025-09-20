declare global {
  // A record mapping email strings to the last OTP request timestamp
  var otpLastReq: Record<string, number>;
}

import crypto from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import * as OTPAuth from "otpauth";
import { PrismaClient } from "../../generated/prisma";
import { sendEmail } from "../../utils/sendEmail";

const prisma = new PrismaClient();

async function getOrCreateSecret(email: string) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Generate a random 20-byte base32 secret
    const secret = OTPAuth.Secret.fromHex(
      crypto.randomBytes(20).toString("hex"),
    ).base32;
    user = await prisma.user.create({
      data: { email, password: "", otp: secret },
    });
    return OTPAuth.Secret.fromBase32(secret);
  }

  if (!user.otp) {
    const secret = OTPAuth.Secret.fromHex(
      crypto.randomBytes(20).toString("hex"),
    ).base32;
    await prisma.user.update({ where: { email }, data: { otp: secret } });
    return OTPAuth.Secret.fromBase32(secret);
  }

  return OTPAuth.Secret.fromBase32(user.otp);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  // Ensure global record exists
  if (!global.otpLastReq) global.otpLastReq = {};

  // Basic rate limiting: allow 1 request per 30 seconds per email (in production, use Redis or similar)
  const now = Date.now();
  if (!global.otpLastReq[email]) global.otpLastReq[email] = 0;

  if (now - global.otpLastReq[email] < 30 * 1000) {
    return res
      .status(429)
      .json({ error: "Please wait before requesting another OTP." });
  }

  global.otpLastReq[email] = now;

  const secret = await getOrCreateSecret(email);
  const totp = new OTPAuth.TOTP({
    issuer: "BlindApp",
    label: email,
    secret,
    digits: 6,
    period: 120,
  });
  const otp = totp.generate();

  // Send OTP via email provider
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
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Failed to send OTP email." });
  }

  return res.status(200).json({ message: "OTP sent to your email." });
}
