import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const { userId } = verifyToken(token);
    (req as any).userId = userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}
