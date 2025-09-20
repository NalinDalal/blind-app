
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../generated/prisma';

import * as OTPAuth from 'otpauth';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  if (!user.otp) {
    return res.status(400).json({ error: 'OTP secret not set for user' });
  }
  const totp = new OTPAuth.TOTP({
    issuer: 'BlindApp',
    label: email,
    secret: OTPAuth.Secret.fromBase32(user.otp),
    digits: 6,
    period: 180,    //time period of 3 minutes
  });
  const delta = totp.validate({ token: otp, window: 0 });
  if (delta === null) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }
  await prisma.user.update({ where: { email }, data: { verified: true } });
  return res.status(200).json({ message: 'OTP verified', id: user.id, email: user.email });
}
