import { z } from "zod";

export const AuthSchema = z
  .object({
    mode: z.enum(["register", "login", "otp", "anon"]),
    email: z
      .email({ message: "Please enter a valid email." })
      .refine((email) => email.endsWith("@oriental.ac.in"), {
        message: "Only @oriental.ac.in emails are allowed.",
      }),
    password: z.string().optional(),
    otp: z.string().optional(),
    anonName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // If in register or login mode, password is required and must be at least 6 characters.
    if (data.mode === "register" || data.mode === "login") {
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must be at least 6 characters.",
        });
      }
    }
    // If in anon mode, the anonymous name is required and must be at least 3 characters.
    if (data.mode === "anon") {
      if (!data.anonName || data.anonName.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["anonName"],
          message: "Anonymous name must be at least 3 characters.",
        });
      }
    }
    // If in OTP mode and an OTP is provided, it must be a 6-digit number.
    if (data.mode === "otp" && data.otp && !/^\d{6}$/.test(data.otp)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otp"],
        message: "OTP must be a 6-digit number.",
      });
    }
  });

// This creates a TypeScript type from the Zod schema
export type Auth = z.infer<typeof AuthSchema>;
