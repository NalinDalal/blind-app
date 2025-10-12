// api/otp/verify
import {timingSafeEqual} from "node:crypto";
import {type NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
    try {
        const {otp, email}: { otp: string; email: string } = await req.json();
        if (!otp || !email)
            return NextResponse.json(
                {error: `OTP or email required`},
                {status: 400},
            );

        const userExists = await prisma.user.findFirst({
            where: {email},
        });
        if (!userExists)
            return NextResponse.json(
                {error: `User doesn't exists can't perform verification`},
                {status: 404},
            );

        if (
            typeof userExists.otp !== "string" ||
            userExists.otp.length === 0 ||
            userExists.otp !== otp ||
            !timingSafeEqual(Buffer.from(userExists.otp), Buffer.from(otp))
        ) {
            await prisma.user.update({
                where: {email},
                data: {otp: null},
            });
            return NextResponse.json({error: `Invalid OTP`}, {status: 401});
        }

        await prisma.user.update({
            where: {email},
            data: {
                verified: true,
                verifiedAt: new Date(),
                otp: null
            }
        })

        return NextResponse.json({success: true, isVerified: true}, {status: 200});
    } catch (err) {
        console.error(`Failed to verify OTP`, err);
        return NextResponse.json(
            {error: `Failed to verify OTP`},
            {status: 500},
        );
    }
};
