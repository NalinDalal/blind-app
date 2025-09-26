//import { PrismaClient } from "../../generated/prisma";
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";

//const _prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// POST /api/token
// Body: { id: string, email: string }
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { id, email } = req.body;
  if (!id || !email) {
    return res.status(400).json({ error: "id and email required" });
  }
  // Optionally: check user exists
  const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: "2h" });
  return res.status(200).json({ token });
}
