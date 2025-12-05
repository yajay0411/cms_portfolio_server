import app from './app';
import config from './config/app.config';
import { initRateLimiter } from './config/rateLimit.config';
import coreDatabase from './config/dbConnect';
import logger from './util/logger';
import { initRedis } from './config/redis.config';

// Initialize server only after all dependencies are ready
const initServer = async (): Promise<void> => {
  let server;

  try {
    // Connect to Prisma
    await coreDatabase.connectPrisma();

    // Connect to MongoDB
    await coreDatabase.connectMongo();

    // Initialize Redis
    await initRedis();

    // Initialize Rate Limiter (Redis-backed)
    await initRateLimiter();

    // Start the server
    server = app.listen(config.PORT);

    logger.info(`APPLICATION_STARTED_SUCCESSFULLY`, {
      meta: {
        ENV: config.ENV,
        PORT: config.PORT,
        SERVER_URL: config.SERVER_URL
      }
    });

    // Handle process termination
    const shutdown = async (): Promise<void> => {
      logger.info('Shutting down server...');

      if (server) {
        server.close((error) => {
          if (error) {
            logger.error('Error during server shutdown', { error });
            process.exit(1);
          }
          logger.info('Server successfully shut down');
          process.exit(0);
        });
      }
    };

    // Handle termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error(`APPLICATION_INITIALIZATION_FAILED`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    if (server) {
      server.close((err) => {
        if (err) {
          logger.error('Error during forced server shutdown', { error: err });
        }
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
};

// Start the server
initServer();
