/*User Search

Users can search for other users only by anonName.
No other identifiers (email, real name, etc.) are searchable.
*/

import { type NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/helpers/auth/user";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

type Mapping = Prisma.AnonMappingGetPayload<{
  select: { anonName: true; userId: true; createdAt: true };
}>;

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const q = (url.searchParams.get("q") || "").trim();
    if (!q)
      return NextResponse.json({ error: "query required" }, { status: 400 });

    // simple guard: avoid extremely long queries
    if (q.length > 15)
      return NextResponse.json({ error: "query too long" }, { status: 400 });

    // require authenticated user
    const userId = await getAuthenticatedUserId();
    if (!userId)
      return NextResponse.json(
        { error: "authentication required" },
        { status: 401 },
      );

    const cursorParam = url.searchParams.get("cursor");
    const limit = 20;

    // we encode cursor as base64 so raw UUIDs are not exposed to clients
    const UUID_REGEX =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    let cursorId: string | undefined;
    if (cursorParam) {
      try {
        const decoded = Buffer.from(cursorParam, "base64").toString("utf8");
        if (!UUID_REGEX.test(decoded)) {
          return NextResponse.json(
            { error: "invalid cursor" },
            { status: 400 },
          );
        }
        cursorId = decoded;
      } catch (e) {
        console.error("invalid cursor decode error:", e);
        return NextResponse.json({ error: "invalid cursor" }, { status: 400 });
      }
    }

    // Query AnonMapping with cursor-based pagination (ordered by createdAt desc)
    const mappings = await prisma.anonMapping.findMany({
      where: { anonName: { contains: q, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { id: cursorId } : undefined,
      select: { id: true, anonName: true },
    });

    // Only expose anonName to the client to preserve anonymity
    const users = mappings.map((m: { anonName: string }) => m.anonName);

    let nextCursor: string | null = null;
    if (mappings.length === limit)
      nextCursor = Buffer.from(mappings[limit - 1].id).toString("base64");

    return NextResponse.json({ users, nextCursor });
  } catch (err) {
    console.error("search error", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

/**
 * findUsersByAnonName(q)
 * - Ensures search only uses anonName
 * - Returns only safe fields: id, anonName, publicProfile, createdAt
 * - Tries common DB clients (Prisma, Mongoose). Falls back to a small in-memory mock
 * Replace / extend with your project's real DB adapter if present.
 */

type SafeUser = {
  id?: string | number;
  anonName: string;
  publicProfile?: unknown;
  createdAt?: string | Date;
};

// Exported helper kept for possible reuse in tests/components
export async function findUsersByAnonName(q: string): Promise<SafeUser[]> {
  if (!q) return [];
  const qTrim = q.trim();
  if (!qTrim) return [];

  // limit and guard
  const limit = 15;
  if (qTrim.length > 15) return [];

  const mappings = await prisma.anonMapping.findMany({
    where: { anonName: { contains: qTrim, mode: "insensitive" } },
    select: { anonName: true, userId: true, createdAt: true },
    take: limit,
  });

  return mappings.map((m: Mapping) => ({
    id: m.userId,
    anonName: m.anonName,
    createdAt: m.createdAt,
  }));
}
