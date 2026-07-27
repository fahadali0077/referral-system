import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { registerUser, verifyCredentials } from '../services/auth.service';
import { signToken } from '../utils/jwt';

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 1000,
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.parse(req.body);
    const user = await registerUser(
      parsed.name,
      parsed.email,
      parsed.password,
      parsed.referralCode
    );
    const token = signToken(user.id);
    res.cookie('token', token, cookieOpts);
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await verifyCredentials(parsed.email, parsed.password);
    const token = signToken(user.id);
    res.cookie('token', token, cookieOpts);
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (e) {
    next(e);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token');
  res.status(204).send();
}
