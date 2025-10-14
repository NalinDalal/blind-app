// helpers/auth/user.ts

import {cookies} from "next/headers";
import {decodeToken} from "./token";

/**
 * Retrieves the authenticated user's ID from the "token" cookie if present and valid.
 *
 * @returns The user ID extracted from the token, or `null` if the cookie is missing or the token does not contain a `userId`.
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
