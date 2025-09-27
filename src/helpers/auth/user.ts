// helpers/auth/user.ts
import type { NextRequest } from "next/server";
import { decodeToken } from "./token";

export async function getAuthenticatedUserId(
  req: NextRequest,
): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  const decoded = decodeToken(token);

  return decoded?.userId ?? null;
}
