import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const latestPost = await prisma.post.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true, // Only fetch the ID
      },
    });

    return NextResponse.json({ latestPostId: latestPost?.id ?? null });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not fetch the latest post ID." },
      { status: 500 },
    );
  }
}
