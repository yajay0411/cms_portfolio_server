import logger from '@/util/logger';
import { createClient } from 'redis';
import config from './app.config';

const redis = createClient({
  url: config.REDIS_URL || 'redis://localhost:6379'
});

export const initRedis = async (): Promise<void> => {
  await redis.connect();
};

redis.on('connect', async () => {
  // Set a key-value pair in Redis
  await redis.set('SERVER_URL', config.SERVER_URL);
  // Get the value of the key from Redis
  const demoValue = await redis.ping();
  logger.info('REDIS_CONNECTED_SUCCESSFULLY', {
    meta: {
      ENV: config.ENV,
      Ping: demoValue
    }
  });
});

redis.on('error', (err) => {
  logger.error('❌ REDIS_ERROR:', { meta: err });
});

export default redis;
