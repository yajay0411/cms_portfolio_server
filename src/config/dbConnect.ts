import logger from '../util/logger';
import { prisma } from './prisma';

export default {
  connectPrisma: async (): Promise<void> => {
    try {
      await prisma.$connect();
      logger.info('✅ PRISMA_CONNECTED_SUCCESSFULLY');
    } catch (err) {
      logger.error('❌ PRISMA_CONNECTION_ERROR', { meta: err });
      process.exit(1);
    }
  }
};
