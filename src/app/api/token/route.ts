import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { id, email } = await req.json();
    if (!id || !email) {
      return NextResponse.json(
        { error: "id and email required" },
        { status: 400 },
      );
    }
    // Optionally: check user exists

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (!userExists) {
      return NextResponse.json(
        { error: "User doesn't exist" },
        { status: 400 },
      );
    }

    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: "2h" });
    return NextResponse.json({ token });
  } catch (err) {
    console.error(`Failed to generate token`, err);
    return NextResponse.json(
      { error: `Failed to generate token` },
      { status: 500 },
    );
  }
}
