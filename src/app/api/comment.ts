import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new comment for a post
export async function POST(req: NextRequest) {
  try {
    const { content, postId, authorId } = await req.json();
    if (!content || !postId || !authorId) {
      return NextResponse.json(
        { error: "Missing content, postId, or authorId" },
        { status: 400 },
      );
    }
    const comment = await prisma.comment.create({
      data: { content, postId, authorId },
    });
    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

// Get all comments for a post
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: { id: true, email: true } },
        // Optionally include likes count
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
