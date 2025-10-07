// src/app/api/logout/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Handles POST requests to log out a user.
 *
 * This endpoint clears the 'token' HttpOnly cookie, effectively logging out the user
 * from the server's perspective.
 *
 * @returns {Promise<NextResponse>} A response confirming successful logout.
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
