import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new post
export async function POST(req: NextRequest) {
  try {
    const { content, authorId, college } = await req.json();
    if (!content || !authorId || !college) {
      return NextResponse.json(
        { error: "Missing content, authorId, or college" },
        { status: 400 },
      );
    }
    const post = await prisma.post.create({
      data: { content, authorId, college },
    });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

// Get all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, email: true } },
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
