import { Connection } from 'mongoose';
import { RateLimiterMongo } from 'rate-limiter-flexible';
import logger from '../util/logger';
import config from './app.config';
import { EApplicationEnvironment, TApplicationEnvironment } from '@/constant/application';

export let rateLimiterMongo: RateLimiterMongo | null = null;

const DURATION = 60;
const POINTS = (config.ENV as TApplicationEnvironment) === EApplicationEnvironment.DEVELOPMENT ? 20 : 10;

export const initRateLimiter = (mongooseConnection: Connection): void => {
  try {
    rateLimiterMongo = new RateLimiterMongo({
      storeClient: mongooseConnection,
      points: POINTS,
      duration: DURATION
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
    rateLimiterMongo = null;
  }
};
