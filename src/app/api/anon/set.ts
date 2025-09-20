import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

// POST /api/anon/set
// Body: { anonName: string, userId: string }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { anonName, userId } = req.body;
  if (!anonName || !userId) {
    return res.status(400).json({ error: "anonName and userId required" });
  }
  // Check for uniqueness
  const existing = await prisma.anonMapping.findUnique({ where: { anonName } });
  if (existing) {
    return res.status(409).json({ error: "anonName already taken" });
  }
  // Optionally: add profanity/appropriateness check here
  // Upsert mapping
  const mapping = await prisma.anonMapping.upsert({
    where: { userId },
    update: { anonName },
    create: { userId, anonName },
  });
  return res.status(200).json({ anonName: mapping.anonName });
}
