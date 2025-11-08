import mongoose from 'mongoose';
import config from '../../config/config';
import logger from '../../util/logger';

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

      logger.info('✅ MongoDB connected successfully', {
        meta: {
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          port: mongoose.connection.port,
          dbName: mongoose.connection.db?.databaseName
        }
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('❌ MongoDB connection error', { meta: err });
      });

      return mongoose.connection;
    } catch (err) {
      logger.error('❌ MongoDB connection failed', { meta: err });
      process.exit(1);
    }
  }
};
