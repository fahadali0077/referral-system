import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', errors: err.errors });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  if (status === 500) console.error(err);

  res.status(status).json({ message });
}
