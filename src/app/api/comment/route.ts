import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { analyzeToxicity } from "@/helpers/contentModeration";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { content, postId, authorId } = await req.json();

    if (!content || !postId || !authorId) {
      return NextResponse.json(
        { error: "Missing content, postId, or authorId" },
        { status: 400 },
      );
    }

    // Use the advanced toxicity check
    if (analyzeToxicity(content).isToxic) {
      // Log moderation action
      await prisma.log.create({
        data: {
          action: "moderation_block_comment",
          details: `Blocked comment by user ${authorId} on post ${postId}: ${content} for ${analyzeToxicity(content).matchedValue}`,
        },
      });
      return NextResponse.json(
        {
          error:
            "Content flagged as inappropriate. Please revise your comment.",
        },
        { status: 403 },
      );
    }

    const comment = await prisma.comment.create({
      data: { content, postId, authorId },
    });

    // Notification logic...
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.authorId !== authorId) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          message: `Your post received a new comment.`,
        },
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
