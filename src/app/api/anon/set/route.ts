import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { analyzeToxicity } from "@/helpers/contentModeration";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export const POST = async (req: NextRequest) => {
  try {
    const { anonName } = await req.json();
    const auth = req.headers.get("authorization");
    if (!anonName || !auth) {
      return NextResponse.json(
        { error: "anonName and Authorization token required" },
        { status: 400 },
      );
    }
    // Profanity filter (basic)
    if (analyzeToxicity(anonName).isToxic) {
      return NextResponse.json(
        { error: "Inappropriate anon name" },
        { status: 400 },
      );
    }
    let userId: string;
    try {
      const decoded = jwt.verify(auth.replace(/^Bearer /, ""), JWT_SECRET) as {
        id: string;
      };
      userId = decoded.id;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }
    // Check for anonName uniqueness
    const existingName = await prisma.anonMapping.findUnique({
      where: { anonName: anonName },
    });
    if (existingName) {
      return NextResponse.json(
        { error: "anonName already taken" },
        { status: 409 },
      );
    }
    // Prevent changing anonName after first set
    const existingUser = await prisma.anonMapping.findUnique({
      where: { userId: userId },
    });
    if (existingUser) {
      return NextResponse.json(
        {
          error: "You have already set your anon name and cannot change it.",
        },
        { status: 403 },
      );
    }
    const mapping = await prisma.anonMapping.create({
      data: { userId, anonName },
    });
    return NextResponse.json({ anonName: mapping.anonName }, { status: 200 });
  } catch (error) {
    console.error(`Failed to set Anon Name: ${error}`);
    return NextResponse.json(
      { error: `Internal Server Error` },
      { status: 500 },
    );
  }
};
