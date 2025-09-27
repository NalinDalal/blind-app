import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// POST /anon/set
// Body: { anonName: string, userId: string }
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { anonName } = req.body;
  const auth = req.headers.authorization;
  if (!anonName || !auth) {
    return res
      .status(400)
      .json({ error: "anonName and Authorization token required" });
  }
  // Profanity filter (basic)
  const banned = [
    "badword1",
    "badword2",
    "admin",
    "mod",
    "fuck",
    "shit",
    "bitch",
  ];
  if (banned.some((word) => anonName.toLowerCase().includes(word))) {
    return res.status(400).json({ error: "Inappropriate anon name" });
  }
  let userId: string;
  try {
    const decoded = jwt.verify(auth.replace(/^Bearer /, ""), JWT_SECRET) as {
      id: string;
    };
    userId = decoded.id;
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  // Check for anonName uniqueness
  const existingName = await prisma.anonMapping.findUnique({
    where: { anonName: anonName },
  });
  if (existingName) {
    return res.status(409).json({ error: "anonName already taken" });
  }
  // Prevent changing anonName after first set
  const existingUser = await prisma.anonMapping.findUnique({
    where: { userId: userId },
  });
  if (existingUser) {
    return res.status(403).json({
      error: "You have already set your anon name and cannot change it.",
    });
  }
  const mapping = await prisma.anonMapping.create({
    data: { userId, anonName },
  });
  return res.status(200).json({ anonName: mapping.anonName });
}
