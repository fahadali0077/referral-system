import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';

// The subset of the Prisma client available inside a $transaction callback.
type TxClient = Prisma.TransactionClient;

/**
 * Looks up the referrer by code BEFORE any user is created, so an invalid
 * code fails fast with no side effects (no ghost account left in the DB).
 */
export async function findReferrerByCode(referralCode: string) {
  const referrer = await prisma.user.findUnique({ where: { referralCode } });

  if (!referrer) {
    const err = new Error('Invalid referral code');
    (err as any).status = 400;
    throw err;
  }

  return referrer;
}

/**
 * Records the referral reward. Must be called with the `tx` handle from
 * registerUser's own $transaction, so if this throws, the new user row
 * created earlier in that same transaction is rolled back too — the whole
 * registration is atomic, not "user created, referral maybe applied".
 */
export async function recordReferral(
  tx: TxClient,
  referrerId: string,
  referredUserId: string
) {
  if (referrerId === referredUserId) {
    const err = new Error('Cannot refer yourself');
    (err as any).status = 400;
    throw err;
  }

  try {
    await tx.referral.create({
      data: {
        referrerId,
        referredUserId,
        pointsAwarded: 10,
      },
    });
    await tx.user.update({
      where: { id: referrerId },
      data: { points: { increment: 10 } },
    });
  } catch (e: any) {
    if (e.code === 'P2002') {
      const err = new Error('Referral reward already granted for this user');
      (err as any).status = 409;
      throw err;
    }
    throw e;
  }
}
