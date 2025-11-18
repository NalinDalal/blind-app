/**
 * @fileoverview OTP secret management for user authentication.
 * Handles creation and retrieval of OTP secrets using OTPAuth library.
 * @module helpers/otpSecret
 */
import crypto from "node:crypto";
import * as OTPAuth from "otpauth";
import { prisma } from "@/lib/prisma";

/**
 * Prisma client instance for database operations.
 * @constant {PrismaClient}
 */

/**
 * Retrieve or create the OTPAuth secret associated with the given email.
 *
 * If no user exists for the email a new user is created with a generated secret.
 *
 * @param email - The user's email address used to look up or create the account
 * @returns An OTPAuth.Secret constructed from the user's base32 OTP secret
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
