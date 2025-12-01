import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import logger from '../util/logger';
import config from './app.config';
import redis from './redis.config';
import { EApplicationEnvironment, TApplicationEnvironment } from '@/constant/application';

export let rateLimiter: RateLimiterRedis | null = null;

const DURATION = 60;
const POINTS = (config.ENV as TApplicationEnvironment) === EApplicationEnvironment.DEVELOPMENT ? 20 : 10;

export const initRateLimiter = async (): Promise<void> => {
  try {
    const insuranceLimiter = new RateLimiterMemory({
      points: POINTS,
      duration: DURATION
    });
    rateLimiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'rl',
      points: POINTS,
      duration: DURATION,
      insuranceLimiter
    });

    logger.info(`RATE_LIMITER_INITIATED_SUCCESSFULLY`, {
      meta: {
        ENV: config.ENV,
        Hits: POINTS,
        Duration: DURATION
      }
    });
  } catch (error) {
    logger.info(`RATE_LIMITER_INITIATED_FAILED`, error);
    rateLimiter = null;
  }
};
