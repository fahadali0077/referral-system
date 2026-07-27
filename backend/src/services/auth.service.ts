import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { generateUniqueReferralCode } from '../utils/referralCode';
import { findReferrerByCode, recordReferral } from './referral.service';

export async function registerUser(
  name: string,
  email: string,
  password: string,
  referralCode?: string
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    (err as any).status = 409;
    throw err;
  }

  // Validate the referral code BEFORE touching the user table. If this
  // throws, nothing has been written yet — no ghost account left behind.
  const referrer = referralCode ? await findReferrerByCode(referralCode) : null;

  const hashed = await bcrypt.hash(password, 12);
  const code = await generateUniqueReferralCode();

  // Create the user and record the referral in one transaction. If
  // recordReferral throws (e.g. race-condition duplicate), the user.create
  // below is rolled back too — registration is fully atomic, never
  // "account created but referral failed".
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        password: hashed,
        referralCode: code,
        ...(referrer ? { referredById: referrer.id } : {}),
      },
    });

    if (referrer) {
      await recordReferral(tx, referrer.id, newUser.id);
    }

    return newUser;
  });

  return { id: user.id, name: user.name, email: user.email, referralCode: user.referralCode };
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid credentials');
    (err as any).status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Invalid credentials');
    (err as any).status = 401;
    throw err;
  }

  return user;
}
