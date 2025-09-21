import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// This is a placeholder for authentication. Replace with your actual auth logic.
async function getAuthenticatedUserId(
  req: NextRequest,
): Promise<string | null> {
  // Example: get userId from a session/cookie/header
  // Return null if not authenticated
  return null;
}

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
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
