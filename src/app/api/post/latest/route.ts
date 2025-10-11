import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Handle GET requests and return the ID of the most recently created post.
 *
 * @returns A JSON response with `latestPostId` set to the most recent post's `id` or `null` if no posts exist. On failure, returns a JSON error object `{ error: "Could not fetch the latest post ID." }` with HTTP status 500.
 */
export async function GET() {
  try {
    const latestPost = await prisma.post.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true, // Only fetch the ID
      },
    });

    return NextResponse.json({ latestPostId: latestPost?.id ?? null });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not fetch the latest post ID." },
      { status: 500 },
    );
  }
}
