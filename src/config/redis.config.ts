import logger from '@/util/logger';
import { createClient } from 'redis';
import config from './app.config';

const redis = createClient({
  url: config.REDIS_URL
});

export const initRedis = async (): Promise<void> => {
  await redis.connect();
};

redis.on('connect', async () => {
  const demoValue = await redis.ping();
  logger.info('REDIS_CONNECTED_SUCCESSFULLY', {
    meta: {
      ENV: config.ENV,
      REDIS_URL: config.REDIS_URL,
      Ping: demoValue
    }
  });
});

redis.on('error', (err) => {
  logger.error('❌ REDIS_ERROR:', { meta: err });
});

export default redis;
