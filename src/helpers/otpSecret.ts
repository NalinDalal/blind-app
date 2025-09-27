import crypto from "node:crypto";
import * as OTPAuth from "otpauth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function getOrCreateSecret(email: string) {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
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
