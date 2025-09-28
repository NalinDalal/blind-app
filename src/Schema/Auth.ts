// src/Schema/Auth.ts

import {z} from "zod";

// Base schema for common fields
const baseSchema = z.object({
    email: z
        .email({message: "Please enter a valid email address."})
        .refine(
            (email) => email.endsWith("oriental.ac.in"),
            "Please use your official college email.",
        ),
});

// Define a schema for each mode
const registerSchema = baseSchema.extend({
    mode: z.literal("register"),
    password: z
        .string()
        .min(6, {message: "Password must be at least 6 characters long."}),
    otp: z.string().optional(),
    anonName: z.string().optional(),
});

const loginSchema = baseSchema.extend({
    mode: z.literal("login"),
    password: z
        .string()
        .min(1, {message: "Password is required."}),
    otp: z.string().optional(),
    anonName: z.string().optional(),
});

const otpSchema = baseSchema.extend({
    mode: z.literal("otp"),
    // OTP is optional to allow both requesting and verifying
    otp: z.string().optional(),
    password: z.string().optional(),
    anonName: z.string().optional(),
});

const anonSchema = z.object({
    mode: z.literal("anon"),
    anonName: z
        .string()
        .min(3, {message: "Name must be at least 3 characters long."}),
    // Make other fields optional as they aren't needed here
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
]);

export type Auth = z.infer<typeof AuthSchema>;