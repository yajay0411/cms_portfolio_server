import mongoose from 'mongoose';
import config from './app.config';
import logger from '../util/logger';

// Enable debug mode for mongoose in development
if (process.env.DEBUG?.includes('mongoose')) {
  mongoose.set('debug', true);
} else {
  mongoose.set('debug', false);
}

export default {
  connect: async (): Promise<mongoose.Connection> => {
    try {
      if (!config.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      // Enhanced connection options
      const options: mongoose.ConnectOptions = {
        autoIndex: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true,
        w: 'majority' as const
      };

      logger.debug('Attempting to connect to MongoDB...', {
        meta: { uri: config.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') }
      });

      await mongoose.connect(config.MONGODB_URI, options);

      logger.info('✅ MONGODB_CONNECTED_SUCCESSFULLY', {
        meta: {
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          port: mongoose.connection.port,
          dbName: mongoose.connection.db?.databaseName
        }
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MONGODB_DISCONNECTED');
        process.exit(1);
      });

      mongoose.connection.on('error', (err) => {
        logger.error('❌ MONGODB_CONNECTION_ERROR', { meta: err });
        process.exit(1);
      });

      return mongoose.connection;
    } catch (err) {
      logger.error('❌ MONGODB_CONNECTION_ERROR', { meta: err });
      process.exit(1);
    }
  }
};
