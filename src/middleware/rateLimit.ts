import { NextFunction, Request, Response } from 'express';
import { rateLimiter } from '../config/rateLimit.config';
import httpError from '../util/httpError';
import responseMessage from '../constant/responseMessage';

export default (req: Request, _: Response, next: NextFunction): void => {
  if (!rateLimiter) {
    return next();
  }

  const key = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || (req.ip as string) || 'unknown';

  rateLimiter
    .consume(key, 1)
    .then(() => {
      next();
    })
    .catch((err: unknown) => {
      const isRateLimited = !!(err && typeof err === 'object' && 'msBeforeNext' in err);
      if (isRateLimited) {
        httpError(next, new Error(responseMessage.TOO_MANY_REQUESTS), req, 429);
      } else {
        next();
      }
    });
};
