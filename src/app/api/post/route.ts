import {type NextRequest, NextResponse} from "next/server";
import {Prisma, PrismaClient} from "@/generated/prisma";
import {analyzeToxicity} from "@/helpers/contentModeration";
import {getAuthenticatedUserId} from "@/helpers/auth/user";

const prisma = new PrismaClient();

// Create a new post
export async function POST(req: NextRequest) {
    try {
        const {content, authorId, college} = await req.json();
        if (!content || !authorId || !college) {
            return NextResponse.json(
                {error: "Missing content, authorId, or college"},
                {status: 400},
            );
        }
        if (analyzeToxicity(content).isToxic) {
            // Log moderation action
            await prisma.log.create({
                data: {
                    action: "moderation_block_post",
                    details: `Blocked post by user ${authorId} (college: ${college}): ${content} for ${analyzeToxicity(content).matchedValue}`,
                },
            });
            return NextResponse.json(
                {error: "Content flagged as toxic/abusive. Please revise your post."},
                {status: 403},
            );
        }
        const post = await prisma.post.create({
            data: {content, authorId, college},
        });
        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json(
            {error: error instanceof Error ? error.message : String(error)},
            {status: 500},
        );
    }
}

// Get all posts

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Fetches posts with cursor-based pagination for infinite scrolling.
 *
 * - **Guests (Unauthenticated):** Receive a single page of 10 posts and no cursor,
 * preventing further loading.
 * - **Logged-in Users (Authenticated):** Receive paginated results. Each response
 * includes a `nextCursor` value (the ID of the last post) to be used in the
 * subsequent request's query parameter (`?cursor=...`).
 *
 * @returns A JSON response containing `posts` and `nextCursor`.
 */
export async function GET(req: NextRequest) {
    try {
        const cursor = req.nextUrl.searchParams.get("cursor");
        const limit = 10;
        const userId = await getAuthenticatedUserId();
        const orderBy: Prisma.PostOrderByWithRelationInput[] = [
            {engagementScore: "desc"},
            {createdAt: "desc"}
        ]
        const queryOptions = {
            take: limit,
            orderBy,
            include: {
                author: {
                    select: {
                        anonMapping: {
                            select: {
                                anonName: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        comments: true
                    }
                }
            }
        }
        if (!userId) {
            const posts = await prisma.post.findMany(queryOptions);
            return NextResponse.json({posts, nextCursor: null})
        }

        if (cursor && UUID_REGEX.test(cursor))
            return NextResponse.json({error: `Invalid Cursor format`}, {status: 400});

        const posts = await prisma.post.findMany({
            ...queryOptions,
            skip: cursor ? 1 : 0,
            cursor: cursor ? {id: cursor} : undefined
        });
        let nextCursor: string | null = null;
        if (posts.length === limit)
            nextCursor = posts[limit - 1].id;
        return NextResponse.json({posts, nextCursor});
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return NextResponse.json(
            {error: "An unexpected error occurred while fetching posts."},
            {status: 500},
        );
    }
}
