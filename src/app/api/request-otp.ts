import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString().slice(0, length);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const otp = generateOTP();
  // Store OTP in DB (for demo, just in user table)
  const user = await prisma.user.upsert({
    where: { email },
    update: { otp },
    create: { email, password: '', otp },
  });
  // In real app, send OTP via email
  return res.status(200).json({ message: 'OTP sent (mock)', otp });
}
