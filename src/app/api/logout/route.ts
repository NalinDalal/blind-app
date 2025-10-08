// src/app/api/logout/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Invalidate the authentication 'token' HttpOnly cookie to log out the user.
 *
 * Clears the 'token' cookie (expires it) and returns a JSON response indicating success or error.
 *
 * @returns A NextResponse with `{ message: "Logout successful" }` and status 200 on success, or with `{ error: "Internal Server Error" }` and status 500 on failure.
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
