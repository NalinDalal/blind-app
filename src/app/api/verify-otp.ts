import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.otp !== otp) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }
  await prisma.user.update({ where: { email }, data: { verified: true, otp: null } });
  return res.status(200).json({ message: 'OTP verified', id: user.id, email: user.email });
}
