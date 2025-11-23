import app from './app';
import config from './config/app.config';
import { initRateLimiter } from './config/rateLimit.config';
import coreDatabase from './config/mongoDB.config';
import logger from './util/logger';
import { initRedis } from './config/redis.config';

const server = app.listen(config.PORT);
(async (): Promise<void> => {
  try {
    // Database Connection
    const connection = await coreDatabase.connect();

    initRedis();

    initRateLimiter(connection);

    logger.info(`APPLICATION_STARTED_SUCCESSFULLY`, {
      meta: {
        PORT: config.PORT,
        SERVER_URL: config.SERVER_URL
      }
    });
  } catch (err) {
    logger.error(`APPLICATION_ERROR`, { meta: err });

    server.close((error) => {
      if (error) {
        logger.error(`APPLICATION_ERROR`, { meta: error });
      }

      process.exit(1);
    });
  }
})();
