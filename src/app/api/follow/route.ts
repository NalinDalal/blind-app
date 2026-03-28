import { type NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/helpers/auth/user";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const currentUserId = await getAuthenticatedUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID required" },
        { status: 400 },
      );
    }

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 },
      );
    }

    // Check if already following or request exists
    const existingFollow = await prisma.follow.findFirst({
      where: {
        OR: [
          { followerId: currentUserId, followingId: targetUserId },
          { followerId: targetUserId, followingId: currentUserId },
        ],
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "Follow relationship already exists" },
        { status: 400 },
      );
    }

    // Create follow request
    const follow = await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
        status: "ACCEPTED", // Auto-accept for now (can be changed to PENDING)
      },
    });

    // Create notification for the target user
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { anonMapping: true },
    });

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: "FOLLOW_ACCEPTED",
        message: `${currentUser?.anonMapping?.anonName || "Someone"} started following you`,
        actorId: currentUserId,
      },
    });

    return NextResponse.json(follow);
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const currentUserId = await getAuthenticatedUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get accepted follows (friends)
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId, status: "ACCEPTED" },
      include: {
        following: {
          include: { anonMapping: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const followers = await prisma.follow.findMany({
      where: { followingId: currentUserId, status: "ACCEPTED" },
      include: {
        follower: {
          include: { anonMapping: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      following: following.map((f) => ({
        id: f.id,
        userId: f.following.id,
        anonName: f.following.anonMapping?.anonName || "Anonymous",
        createdAt: f.createdAt,
      })),
      followers: followers.map((f) => ({
        id: f.id,
        userId: f.follower.id,
        anonName: f.follower.anonMapping?.anonName || "Anonymous",
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get follows error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUserId = await getAuthenticatedUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID required" },
        { status: 400 },
      );
    }

    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: currentUserId, followingId: targetUserId },
          { followerId: targetUserId, followingId: currentUserId },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
