import { type NextRequest, NextResponse } from "next/server";
import { analyzeToxicity } from "@/helpers/contentModeration";
import { prisma } from "@/lib/prisma";

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

    const toxicityResult = analyzeToxicity(content);
    if (toxicityResult.isToxic) {
      await prisma.log.create({
        data: {
          action: "moderation_block_comment",
          details: `Blocked comment by user ${authorId} on post ${postId} for ${toxicityResult.matchedValue}. Content length: ${content.length} chars`,
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

    const [post, user] = await Promise.all([
      prisma.post.findUnique({ where: { id: postId } }),
      prisma.user.findUnique({ where: { id: authorId } }),
    ]);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: { content, postId, authorId, parentId },
    });

    if (post.authorId !== authorId) {
      prisma.notification.create({
        data: {
          userId: post.authorId,
          type: parentId ? "COMMENT_REPLY" : "POST_COMMENT",
          message: parentId
            ? "Your post received a reply on your post comment"
            : "your post received a comment",
        },
      }).catch((err) => console.error("Failed to create notification:", err));
    }

    prisma.post.update({
      where: { id: postId },
      data: { engagementScore: { increment: 5 } },
    }).catch((err) => console.error("Failed to update engagement:", err));

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Comment creation error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
