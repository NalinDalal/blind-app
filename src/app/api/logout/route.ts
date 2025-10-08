// src/app/api/logout/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Log out the current user by clearing the server-side `token` HttpOnly cookie.
 *
 * Clears the `token` cookie (expires it immediately) so subsequent requests are unauthenticated.
 *
 * @returns A JSON NextResponse with `{ message: "Logout successful" }` and status 200 on success, or `{ error: "Internal Server Error" }` and status 500 on failure.
 */
export async function POST(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    // To delete a cookie, we set it again but with a max-age of 0.
    cookieStore.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // Expire the cookie immediately
      path: "/",
    });

    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
