import mongoose from 'mongoose';
import logger from '../util/logger';
import config from './app.config';
import { prisma } from './prisma';

export default {
  connectPrisma: async (): Promise<void> => {
    try {
      await prisma.$connect();
      logger.info('✅ PRISMA_CONNECTED_SUCCESSFULLY', {
        meta: {
          ENV: config.ENV,
          DATABASE: config.DATABASE,
          DB_URL: config.DATABASE_URL
        }
      });
    } catch (err) {
      logger.error('❌ PRISMA_CONNECTION_ERROR', { meta: err });
      process.exit(1);
    }
  },
  connectMongo: async (): Promise<void> => {
    try {
      await mongoose.connect(config.MONGODB_URI);
      logger.info('✅ MONGODB_CONNECTED_SUCCESSFULLY', {
        meta: {
          ENV: config.ENV,
          HOST: mongoose.connection.host,
          DATABASE: mongoose.connection.name
        }
      });
    } catch (err) {
      logger.error('❌ MONGODB_CONNECTION_ERROR', { meta: err });
      process.exit(1);
    }
  }
};
