import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        referrals: {
          select: { name: true, email: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      referralCode: user.referralCode,
      points: user.points,
      referredUsers: user.referrals,
    });
  } catch (e) {
    next(e);
  }
}
