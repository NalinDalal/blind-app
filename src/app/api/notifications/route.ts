import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/helpers/auth/user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentUserId = await getAuthenticatedUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: currentUserId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
