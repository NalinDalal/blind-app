import {type NextRequest, NextResponse} from "next/server";
import * as OTPAuth from "otpauth";
import {PrismaClient} from "@/generated/prisma";
import {cookies} from "next/headers"
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

/**
 * Verify a user's time-based one-time password (TOTP), mark the user as verified, set a JWT cookie to log them in, and return user info.
 *
 * Validates the request body for `email` and `otp`, ensures the stored OTP secret is present and well-formed,
 * constructs a TOTP validator, and, on successful verification, marks the user as verified and returns user info.
 *
 * @param req - The incoming NextRequest containing a JSON body with `email` and `otp`
 * @returns On success: a JSON object with `message: "OTP verified"`, `id`, `email`, and `anonName` (or `null`).
 * On failure: a JSON object with an `error` message and an appropriate HTTP status code
 * (`400` for missing/invalid input, `401` for not found or invalid/expired OTP, `500` for server errors).
 */
export async function POST(req: NextRequest) {
    try {
        const {email, otp} = await req.json();
        if (!email || !otp)
            return NextResponse.json(
                {error: "Email and OTP required"},
                {status: 400},
            );

        const user = await prisma.user.findUnique(
            {
                where: {email},
                include: {
                    anonMappings: true
                }
            },
        );
        if (!user) {
            return NextResponse.json({error: "User not found"}, {status: 401});
        }

        // Ensure the secret is a non-empty string before proceeding
        if (typeof user.otp !== "string" || user.otp.length === 0) {
            return NextResponse.json(
                {error: "Invalid OTP secret format"},
                {status: 400},
            );
        }

        if (!user.otp) {
            return NextResponse.json(
                {error: "OTP secret not set for user"},
                {status: 400},
            );
        }
        const totp = new OTPAuth.TOTP({
            issuer: "BlindApp",
            label: email,
            secret: OTPAuth.Secret.fromBase32(user.otp),
            digits: 6,
            period: 120,
        });
        const delta = totp.validate({token: otp, window: 0});
        if (delta === null) {
            return NextResponse.json(
                {error: "Invalid or expired OTP"},
                {status: 401},
            );
        }
        await prisma.user.update({where: {email}, data: {verified: true}});

        const token = jwt.sign({id: user.id, email: user.email}, JWT_SECRET, {
            expiresIn: "2h",
        });

        (await cookies()).set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
            maxAge: 60 * 60 * 2,
        })

        const anonName = user.anonMappings.length > 0 ? user.anonMappings[0].anonName : null;

        return NextResponse.json({
            message: "OTP verified",
            id: user.id,
            email: user.email,
            anonName
        });
    } catch (err) {
        console.error(`Failed to verify OTP`, err);
        return NextResponse.json(
            {error: `Failed to verify OTP`},
            {status: 500},
        );
    }
}
