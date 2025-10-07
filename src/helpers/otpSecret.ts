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
 * Retrieves or creates an OTP secret for a user.
 * If the user doesn't exist, creates a new user with a generated OTP secret.
 * If the user exists but has no OTP secret, generates and assigns one.
 *
 * @async
 * @function getOrCreateSecret
 * @param {string} email - User's email address
 * @returns {Promise<OTPAuth.Secret>} OTP secret object in base32 format
 *
 * @example
 * const secret = await getOrCreateSecret("user@oriental.ac.in");
 * // Returns OTPAuth.Secret instance that can be used to generate OTP tokens
 *
 * @description
 * The function follows this logic:
 * 1. Checks if user exists in database
 * 2. If not, creates user with new OTP secret
 * 3. If user exists but has no OTP, generates and assigns one
 * 4. If user has OTP, returns existing secret
 *
 * @throws {Error} Database operation failure
 */
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
