import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {type NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@/generated/prisma";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export async function POST(req: NextRequest) {
    try {
        const {email, password} = await req.json();
        if (!email || !password) {
            return NextResponse.json(
                {error: "Email and password required"},
                {status: 400},
            );
        }
        const user = await prisma.user.findUnique({where: {email}});
        const anonMapping = await prisma.anonMapping.findUnique({where: {userId: user?.id}})
        if (!user) {
            return NextResponse.json(
                {error: "Invalid credentials"},
                {status: 401},
            );
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return NextResponse.json(
                {error: "Invalid credentials"},
                {status: 401},
            );
        }
        // Return JWT token for authenticated requests
        const token = jwt.sign({id: user.id, email: user.email}, JWT_SECRET, {
            expiresIn: "2h",
        });
        return NextResponse.json(
            {token, id: user.id, email: user.email, anonName: anonMapping ? anonMapping.anonName : null},
            {status: 200},
        );
    } catch (error) {
        console.error(`Error Login: ${error}`);
        return NextResponse.json({error: "Login Failed"}, {status: 500});
    }
}
