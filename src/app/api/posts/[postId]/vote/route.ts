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
    const { vote } = await req.json(); // "UPVOTE" or "DOWNVOTE"

    if (!vote || !["UPVOTE", "DOWNVOTE"].includes(vote)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check existing vote
    const existingVote = await prisma.postVote.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: currentUserId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.vote === vote) {
        // Remove vote (toggle off)
        await prisma.postVote.delete({
          where: { id: existingVote.id },
        });

        const voteCount = await getVoteCount(postId);
        return NextResponse.json({ voteCount, userVote: null });
      }

      // Change vote
      await prisma.postVote.update({
        where: { id: existingVote.id },
        data: { vote },
      });

      const voteCount = await getVoteCount(postId);
      return NextResponse.json({ voteCount, userVote: vote });
    }

    // Create new vote
    await prisma.postVote.create({
      data: {
        postId,
        userId: currentUserId,
        vote,
      },
    });

    const voteCount = await getVoteCount(postId);
    return NextResponse.json({ voteCount, userVote: vote });
  } catch (error) {
    console.error("Vote error:", error);
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
    const currentUserId = await getAuthenticatedUserId();
    const { postId } = await params;

    const voteCount = await getVoteCount(postId);

    let userVote = null;
    if (currentUserId) {
      const existingVote = await prisma.postVote.findUnique({
        where: {
          postId_userId: {
            postId,
            userId: currentUserId,
          },
        },
      });
      userVote = existingVote?.vote || null;
    }

    return NextResponse.json({ voteCount, userVote });
  } catch (error) {
    console.error("Get vote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function getVoteCount(postId: string) {
  const upvoters = await prisma.postVote.count({
    where: { postId, vote: "UPVOTE" },
  });
  const downvoters = await prisma.postVote.count({
    where: { postId, vote: "DOWNVOTE" },
  });

  return {
    upvotes: upvoters,
    downvotes: downvoters,
    score: upvoters - downvoters,
  };
}
