import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: `ID is required` }, { status: 400 });
    }
    const userWithData = await prisma.user.findUnique({
      where: { id },
      include: {
        anonMapping: {
          select: {
            anonName: true,
          },
        },
        posts: true,
        comments: true,
        commentLikes: true,
        notifications: true,
        loginLogs: true,
        _count: true,
      },
      omit: {
        otp: true,
        password: true,
        otpExpiresAt: true,
      },
    });
    return NextResponse.json(userWithData);
  } catch (err) {
    console.error(`Failed to fetch User data: `, err);
    return NextResponse.json(
      { error: `Internal Server Error` },
      { status: 500 },
    );
  }
};
