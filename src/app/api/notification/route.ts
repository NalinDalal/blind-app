/**
 * @fileoverview API routes for notification management.
 * Handles creating, retrieving, and marking notifications as read.
 * @module api/notification
 */
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Prisma client instance for database operations.
 * @constant {PrismaClient}
 */

// Create a notification
/**
 * POST endpoint to create a new notification for a user.
 *
 * @async
 * @function POST
 * @param {NextRequest} req - The incoming Next.js request object
 * @returns {Promise<NextResponse>} JSON response with the created notification or error
 *
 * @example
 * // Request body
 * // {
 * //   "userId": "user_123",
 * //   "message": "Someone liked your comment",
 * //   "type": "COMMENT_LIKE"
 * // }
 *
 * @example
 * // Success response (200)
 * // {
 * //   "id": "notif_456",
 * //   "userId": "user_123",
 * //   "message": "Someone liked your comment",
 * //   "type": "COMMENT_LIKE",
 * //   "read": false,
 * //   "createdAt": "2025-01-15T10:30:00Z"
 * // }
 *
 * @throws {400} Missing required fields (userId, message, type)
 * @throws {400} Invalid notification type
 * @throws {500} Database operation failure
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, message, type } = await req.json();
    if (!userId || !message || !type) {
      return NextResponse.json(
        { error: "Missing userId, message, or type" },
        { status: 400 },
      );
    }

    // Validate type is a valid NotificationType
    const validTypes = [
      "COMMENT_LIKE",
      "POST_COMMENT",
      "COMMENT_REPLY",
      "MENTION",
      "SYSTEM",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid notification type" },
        { status: 400 },
      );
    }

    const notification = await prisma.notification.create({
      data: { userId, message, type },
    });
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

// Get notifications for a user
/**
 * GET endpoint to retrieve all notifications for a specific user.
 * Notifications are returned in descending order by creation time.
 *
 * @async
 * @function GET
 * @param {NextRequest} req - The incoming Next.js request object with userId query parameter
 * @returns {Promise<NextResponse>} JSON array of notifications or error
 *
 * @example
 * // GET /api/notification?userId=user_123
 * // Response (200)
 * // [
 * //   {
 * //     "id": "notif_456",
 * //     "userId": "user_123",
 * //     "message": "Someone liked your comment",
 * //     "type": "COMMENT_LIKE",
 * //     "read": false,
 * //     "createdAt": "2025-01-15T10:30:00Z"
 * //   }
 * // ]
 *
 * @throws {400} Missing userId query parameter
 * @throws {500} Database query failure
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

// Mark a notification as read
/**
 * PATCH endpoint to mark a notification as read.
 * Updates the read status and sets the readAt timestamp.
 *
 * @async
 * @function PATCH
 * @param {NextRequest} req - The incoming Next.js request object
 * @returns {Promise<NextResponse>} JSON response with the updated notification or error
 *
 * @example
 * // Request body
 * // {
 * //   "notificationId": "notif_456"
 * // }
 *
 * @example
 * // Success response (200)
 * // {
 * //   "id": "notif_456",
 * //   "read": true,
 * //   "readAt": "2025-01-15T10:35:00Z"
 * // }
 *
 * @throws {400} Missing notificationId in request body
 * @throws {500} Database update failure
 */
export async function PATCH(req: NextRequest) {
  try {
    const { notificationId } = await req.json();
    if (!notificationId) {
      return NextResponse.json(
        { error: "Missing notificationId" },
        { status: 400 },
      );
    }
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
