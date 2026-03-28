import { type NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/helpers/auth/user";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const currentUserId = await getAuthenticatedUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Create share record
    const share = await prisma.share.create({
      data: {
        postId,
        userId: currentUserId,
      },
    });

    // Create notification for post author (if not self-share)
    if (post.authorId !== currentUserId) {
      const sharer = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: { anonMapping: true },
      });

      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: "SYSTEM",
          message: `${sharer?.anonMapping?.anonName || "Someone"} shared your post`,
          actorId: currentUserId,
          postId,
        },
      });
    }

    // Get share count
    const shareCount = await prisma.share.count({
      where: { postId },
    });

    return NextResponse.json({ share, shareCount });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;

    const shareCount = await prisma.share.count({
      where: { postId },
    });

    return NextResponse.json({ shareCount });
  } catch (error) {
    console.error("Get share count error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
