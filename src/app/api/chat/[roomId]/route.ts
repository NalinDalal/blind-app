import { type NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/helpers/auth/user";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const currentUserId = await getAuthenticatedUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    // Verify user is member of this room
    const membership = await prisma.chatRoomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: currentUserId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          include: { anonMapping: true },
        },
      },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        roomId,
        receiverId: currentUserId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const currentUserId = await getAuthenticatedUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    // Verify user is member
    const membership = await prisma.chatRoomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: currentUserId,
        },
      },
      include: {
        room: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get receiver
    const receiver = membership.room.members.find(
      (m) => m.userId !== currentUserId,
    );

    if (!receiver) {
      return NextResponse.json({ error: "No receiver found" }, { status: 400 });
    }

    // Check if chat is allowed (friends or request accepted)
    const firstMessage = await prisma.message.findFirst({
      where: { roomId },
      orderBy: { createdAt: "asc" },
    });

    if (firstMessage?.isChatRequest && !firstMessage.requestAccepted) {
      return NextResponse.json(
        { error: "Chat request not accepted yet" },
        { status: 403 },
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: currentUserId,
        receiverId: receiver.userId,
        content,
        status: "SENT",
      },
      include: {
        sender: {
          include: { anonMapping: true },
        },
      },
    });

    // Update room timestamp
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const currentUserId = await getAuthenticatedUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const { action, messageId } = await req.json();

    if (action === "accept") {
      // Accept chat request
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message || message.receiverId !== currentUserId) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }

      await prisma.message.update({
        where: { id: messageId },
        data: {
          requestAccepted: true,
          status: "DELIVERED",
        },
      });

      // Create notification for sender
      const receiver = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: { anonMapping: true },
      });

      await prisma.notification.create({
        data: {
          userId: message.senderId,
          type: "SYSTEM",
          message: `${receiver?.anonMapping?.anonName || "Someone"} accepted your chat request`,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Chat action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
