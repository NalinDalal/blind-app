import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }
    // Only allow emails from @oriental.ac.in
    if (!/^\w+@oriental\.ac\.in$/i.test(email)) {
      return NextResponse.json(
        { error: "Only college emails (@oriental.ac.in) are allowed." },
        { status: 400 },
      );
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });
    return NextResponse.json(
      { id: user.id, email: user.email },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user", error);
    return NextResponse.json({ error: "Internal Server Error", status: 500 });
  }
}
