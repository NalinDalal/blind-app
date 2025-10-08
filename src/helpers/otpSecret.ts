/**
 * @fileoverview OTP secret management for user authentication.
 * Handles creation and retrieval of OTP secrets using OTPAuth library.
 * @module helpers/otpSecret
 */
import crypto from "node:crypto";
import * as OTPAuth from "otpauth";
import { PrismaClient } from "@/generated/prisma";

/**
 * Prisma client instance for database operations.
 * @constant {PrismaClient}
 */
const prisma = new PrismaClient();

/**
 * Retrieve the OTP secret for the given email, creating and persisting a new base32 secret if the user or their secret does not exist.
 *
 * @param email - The user's email address
 * @returns An `OTPAuth.Secret` constructed from the user's stored base32 secret
 */
export async function getOrCreateSecret(
  email: string,
): Promise<OTPAuth.Secret> {
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