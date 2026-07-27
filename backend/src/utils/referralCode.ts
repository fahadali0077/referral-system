import { nanoid } from 'nanoid';
import { prisma } from './prisma';

export async function generateUniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = nanoid(8).toUpperCase();
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  throw new Error('Could not generate a unique referral code, try again');
}
