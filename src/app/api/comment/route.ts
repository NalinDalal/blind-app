import { type NextRequest, NextResponse } from "next/server";
import { analyzeToxicity } from "@/helpers/contentModeration";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

/**
 * Create a new comment for a post.
 *
 * Validates the request body, rejects content flagged as toxic, persists the comment, optionally notifies the post author, and increments the post's engagement score.
 *
 * @param req - NextRequest whose JSON body must include `content`, `postId`, and `authorId`; may include `parentId` to indicate a reply
 * @returns The created comment object on success; on failure, a JSON error object describing the cause of the failure
 */
export async function POST(req: NextRequest) {
  try {
    const { content, postId, authorId, parentId } = await req.json();

    if (!content || !postId || !authorId) {
      return NextResponse.json(
        { error: "Missing content, postId, or authorId" },
        { status: 400 },
      );
    }

    const comment = await prisma.$transaction(async (tx: PrismaClient) => {
      // 1. Check toxicity first (fast, no DB call)
      const toxicityResult = analyzeToxicity(content);
      if (toxicityResult.isToxic) {
        await tx.log.create({
          data: {
            action: "moderation_block_comment",
            details: `Blocked comment by user ${authorId} on post ${postId} for ${toxicityResult.matchedValue}. Content length: ${content.length} chars`,
          },
        });
        throw new Error("TOXIC_COMMENT");
      }

      // 2. Validate post and user exist (parallel for performance)
      const [post, user] = await Promise.all([
        tx.post.findUnique({ where: { id: postId } }),
        tx.user.findUnique({ where: { id: authorId } }),
      ]);

      if (!post) {
        throw new Error("POST_NOT_FOUND");
      }

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      // 3. Create the comment (now we know everything is valid)
      const comment = await tx.comment.create({
        data: { content, postId, authorId, parentId },
      });

      // 4. Create notification if commenting on someone else's post
      if (post.authorId !== authorId) {
        await tx.notification.create({
          data: {
            userId: post.authorId,
            type: parentId ? "COMMENT_REPLY" : "POST_COMMENT",
            message: parentId
              ? "Your post received a reply on your post comment"
              : "your post received a comment",
          },
        });
      }

      // 5. Increment engagement score
      await tx.post.update({
        where: { id: postId },
        data: {
          engagementScore: { increment: 5 },
        },
      });

      return comment;
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "TOXIC_COMMENT") {
        return NextResponse.json(
          {
            error:
              "Content flagged as inappropriate. Please revise your comment.",
          },
          { status: 403 },
        );
      }
      if (error.message === "POST_NOT_FOUND") {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      if (error.message === "USER_NOT_FOUND") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    console.error("Comment creation error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
