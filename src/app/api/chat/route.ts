import { type NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/helpers/auth/user";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const currentUserId = await getAuthenticatedUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content, isChatRequest } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content required" },
        { status: 400 },
      );
    }

    if (currentUserId === receiverId) {
      return NextResponse.json(
        { error: "Cannot message yourself" },
        { status: 400 },
      );
    }

    // Check if users are friends (either follows accepted)
    const areFriends = await prisma.follow.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { followerId: currentUserId, followingId: receiverId },
          { followerId: receiverId, followingId: currentUserId },
        ],
      },
    });
    const isFriend = !!areFriends;

    // Check if there's already a chat room
    let room = await prisma.chatRoom.findFirst({
      where: {
        type: "DIRECT",
        members: {
          some: {
            userId: currentUserId,
          },
        },
      },
      include: {
        members: true,
      },
    });

    // Find existing room with this receiver
    if (room) {
      const otherMember = room.members.find((m) => m.userId === receiverId);
      if (!otherMember) {
        // Add receiver to existing room
        await prisma.chatRoomMember.create({
          data: {
            roomId: room.id,
            userId: receiverId,
          },
        });
      }
    } else {
      // Create new chat room
      room = await prisma.chatRoom.create({
        data: {
          type: "DIRECT",
          members: {
            create: [{ userId: currentUserId }, { userId: receiverId }],
          },
        },
        include: {
          members: true,
        },
      });
    }

    // Check if sender has already sent a message (for non-friends)
    if (!areFriends) {
      const existingRequest = await prisma.message.findFirst({
        where: {
          senderId: currentUserId,
          receiverId,
          isChatRequest: true,
          requestAccepted: false,
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingRequest) {
        return NextResponse.json(
          { error: "You already sent a chat request. Wait for acceptance." },
          { status: 400 },
        );
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        roomId: room.id,
        senderId: currentUserId,
        receiverId,
        content,
        isChatRequest: !isFriend,
        requestAccepted: isFriend || false,
        status: isFriend ? "SENT" : "BLOCKED",
      },
    });

    // Create notification for receiver
    if (!isFriend) {
      const sender = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: { anonMapping: true },
      });

      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: "CHAT_REQUEST",
          message: `${sender?.anonMapping?.anonName || "Someone"} sent you a message request`,
          actorId: currentUserId,
          messageId: message.id,
        },
      });
    }

    return NextResponse.json({
      message,
      roomId: room.id,
      isChatRequest: !isFriend,
    });
  } catch (error) {
    console.error("Chat error:", error);
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

    // Get all chat rooms for current user
    const rooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: { userId: currentUserId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              include: { anonMapping: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Format response
    const formattedRooms = rooms.map((room) => {
      const otherMember = room.members.find((m) => m.userId !== currentUserId);
      const lastMessage = room.messages[0];

      return {
        roomId: room.id,
        otherUser: otherMember
          ? {
              userId: otherMember.userId,
              anonName: otherMember.user.anonMapping?.anonName || "Anonymous",
            }
          : null,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
              isChatRequest: lastMessage.isChatRequest,
              requestAccepted: lastMessage.requestAccepted,
            }
          : null,
        updatedAt: room.updatedAt,
      };
    });

    return NextResponse.json(formattedRooms);
  } catch (error) {
    console.error("Get chats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
