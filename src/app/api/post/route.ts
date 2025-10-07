import {type NextRequest, NextResponse} from "next/server";
import {Prisma} from "@/generated/prisma";
import {analyzeToxicity} from "@/helpers/contentModeration";
import {getAuthenticatedUserId} from "@/helpers/auth/user";
import {prisma} from "@/lib/prisma";

/**
 * Create a new post from the request JSON after validating required fields and applying toxicity moderation.
 *
 * Validates that `content`, `authorId`, and `college` are present. If `content` is flagged as toxic, a moderation log entry is created and the request is rejected. On success, the new post is persisted and returned.
 *
 * @returns The created post object wrapped in a NextResponse on success. On failure, returns a JSON error `{ error: string }` with HTTP status `400` for missing fields, `403` if content is flagged as toxic (a moderation log entry will be created), or `500` for internal errors.
 */
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

        // Define the ordering for the posts
        const orderBy: Prisma.PostOrderByWithRelationInput[] = [
            {createdAt: "desc"},
            {engagementScore: "desc"}
        ];
        const orderByInclude: Prisma.PostOrderByWithRelationInput[] = [
            {createdAt: "asc"}
        ];

        // Define the complex include structure to fetch nested data
        const include = {
            author: {
                select: {
                    anonMapping: { // Correct relation name is anonMapping (one-to-one)
                        select: {
                            anonName: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    comments: true,
                },
            },
            // Fetch comments and their replies
            comments: {
                where: {parentId: null}, // Only fetch top-level comments
                orderBy: orderByInclude,
                include: {
                    author: {
                        select: {anonMapping: {select: {anonName: true}}},
                    },
                    // For each top-level comment, include its replies
                    replies: {
                        orderBy: orderByInclude,
                        include: {
                            author: {
                                select: {anonMapping: {select: {anonName: true}}},
                            },
                        },
                    },
                },
            },
        };

        // --- Guest and Logged-in User Logic ---

        if (!userId) { // Guest user
            const posts = await prisma.post.findMany({
                take: limit,
                orderBy,
                include,
                where: {deletedAt: null}, // Ensure we don't fetch soft-deleted posts
            });
            return NextResponse.json({posts, nextCursor: null});
        }

        // Logged-in user
        if (cursor && !UUID_REGEX.test(cursor)) {
            return NextResponse.json({error: "Invalid Cursor format"}, {status: 400});
        }

        const posts = await prisma.post.findMany({
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? {id: cursor} : undefined,
            orderBy,
            include,
            where: {deletedAt: null}, // Ensure we don't fetch soft-deleted posts
        });

        let nextCursor: string | null = null;
        if (posts.length === limit) {
            nextCursor = posts[limit - 1].id;
        }

        return NextResponse.json({posts, nextCursor});

    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return NextResponse.json(
            {error: "An unexpected error occurred while fetching posts."},
            {status: 500},
        );
    }
}