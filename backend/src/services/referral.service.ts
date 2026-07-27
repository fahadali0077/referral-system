import { prisma } from '../utils/prisma';

export async function applyReferral(referralCode: string, newUserId: string) {
  const referrer = await prisma.user.findUnique({ where: { referralCode } });

  if (!referrer) {
    const err = new Error('Invalid referral code');
    (err as any).status = 400;
    throw err;
  }

  if (referrer.id === newUserId) {
    const err = new Error('Cannot refer yourself');
    (err as any).status = 400;
    throw err;
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: newUserId },
        data: { referredById: referrer.id },
      }),
      prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredUserId: newUserId,
          pointsAwarded: 10,
        },
      }),
      prisma.user.update({
        where: { id: referrer.id },
        data: { points: { increment: 10 } },
      }),
    ]);
  } catch (e: any) {
    if (e.code === 'P2002') {
      const err = new Error('Referral reward already granted for this user');
      (err as any).status = 409;
      throw err;
    }
    throw e;
  }
}
