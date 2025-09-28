import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { getAuthenticatedUserId } from "@/helpers/auth/user";

const prisma = new PrismaClient();

// Like a comment (requires authentication)
export async function POST(req: NextRequest) {
  try {
    const { commentId } = await req.json();
    if (!commentId) {
      return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
    }
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    // Check if already liked
    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });
    if (existing) {
      // If already liked, remove the like (unlike)
      await prisma.commentLike.delete({
        where: { commentId_userId: { commentId, userId } },
      });
      return NextResponse.json({ liked: false });
    } else {
      // If not liked, add the like
      await prisma.commentLike.create({
        data: { commentId, userId },
      });
      // Notify comment author (if not self)
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (comment && comment.authorId !== userId) {
        await prisma.notification.create({
          data: {
            userId: comment.authorId,
            message: `Your comment received a new like.`,
          },
        });
      }
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
