// helpers/auth/user.ts

import { cookies } from "next/headers";
import { decodeToken } from "./token";

export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const decoded = decodeToken(token);

  return decoded?.userId ?? null;
}
