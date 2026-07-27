import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Too many attempts, please try again shortly' },
  standardHeaders: true,
  legacyHeaders: false,
});
