import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { generateUniqueReferralCode } from '../utils/referralCode';
import { applyReferral } from './referral.service';

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

  const hashed = await bcrypt.hash(password, 12);
  const code = await generateUniqueReferralCode();

  const user = await prisma.user.create({
    data: { name, email, password: hashed, referralCode: code },
  });

  if (referralCode) {
    // Referral failure should not silently break registration but should
    // surface clearly — decide based on product need. Here we let it throw
    // so the frontend can show "account created, but referral code was invalid".
    await applyReferral(referralCode, user.id);
  }

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
