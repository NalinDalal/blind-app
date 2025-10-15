// helpers/auth/user.ts

import { cookies } from "next/headers";
import { decodeToken } from "./token";

/**
 * Retrieve the authenticated user's ID from the "token" cookie.
 *
 * Returns the `id` claim from the decoded token stored in the "token" cookie, or `null` if the cookie is missing or the token does not contain an `id`.
 *
 * @returns The user ID from the token's `id` claim, or `null` if unavailable.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return null;
  }

  const decoded = decodeToken(token);

  return decoded?.id ?? null;
}