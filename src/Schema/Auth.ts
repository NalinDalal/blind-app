// src/Schema/Auth.ts

import { z } from "zod";

// Base schema for common fields
const baseSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .refine((email) => {
      // Allow empty string to pass here; other schemas will enforce requirement
      if (!email) return true;
      const host = email.split("@")[1]?.toLowerCase();
      return host === "oriental.ac.in" || host?.endsWith(".oriental.ac.in");
    }, "Please use your official college email."),
});

// Define a schema for each mode
const registerSchema = baseSchema.extend({
  mode: z.literal("register"),
  // Re-define email here to make it required for this mode
  email: baseSchema.shape.email.min(1, { message: "Email is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
  otp: z.string().optional(),
  anonName: z.string().optional(),
});

const loginSchema = baseSchema.extend({
  mode: z.literal("login"),
  email: baseSchema.shape.email.min(1, { message: "Email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
  otp: z.string().optional(),
  anonName: z.string().optional(),
});

const otpSchema = baseSchema.extend({
  mode: z.literal("otp"),
  email: baseSchema.shape.email.min(1, { message: "Email is required." }),
  // OTP is optional to allow both requesting and verifying
  otp: z.string().optional(),
  password: z.string().optional(),
  anonName: z.string().optional(),
});

// ✅ --- ADDED SCHEMA FOR THE VERIFICATION FLOW --- ✅
const verifyEmailSchema = z.object({
  mode: z.literal("verifyEmail"),
  otp: z
    .string()
    .min(6, { message: "OTP must be 6 characters." })
    .max(6, { message: "OTP must be 6 characters." }),
  // Make other fields optional as they aren't needed for this specific action
  email: z.string().optional(),
  password: z.string().optional(),
  anonName: z.string().optional(),
});

const anonSchema = z.object({
  mode: z.literal("anon"),
  anonName: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long." })
    .max(20, { message: "Name must be 20 characters or less." }),
  // Make other fields optional
  email: z.string().optional(),
  password: z.string().optional(),
  otp: z.string().optional(),
});

// The discriminated union automatically picks the right schema based on the 'mode' field
export const AuthSchema = z.discriminatedUnion("mode", [
  registerSchema,
  loginSchema,
  otpSchema,
  anonSchema,
  verifyEmailSchema, // <-- ADDED
]);

export type Auth = z.infer<typeof AuthSchema>;
