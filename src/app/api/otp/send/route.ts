import {type NextRequest, NextResponse} from "next/server";
import {sendOtpMail} from "@/lib/mail/methods/sentOtpMail";
import {prisma} from "@/lib/prisma";
import {generateRandomOTP} from "@/utils/otp";

export const POST = async (req: NextRequest) => {
    try {
        const {email}: { email: string } = await req.json();
        if (!email) {
            return NextResponse.json({error: `Email required`}, {status: 400});
        }
        const userExists = await prisma.user.findFirst({
            where: {email},
        });
        if (!userExists) {
            return NextResponse.json(
                {error: `User doesn't exits with email ${email}`},
                {status: 400},
            );
        }

        const otp = generateRandomOTP().toString();
        await prisma.user.update({
            where: {email},
            data: {
                otp,
            },
        });

        // send mail
        await sendOtpMail({
            to: email,
            otpCode: otp,
        });
        return NextResponse.json(
            {message: `OTP send to your email successfully!`},
            {status: 200},
        );
    } catch (err) {
        console.error(`Failed to send OTP`, err);
        return NextResponse.json({error: "Failed to send OTP"}, {status: 500});
    }
};
