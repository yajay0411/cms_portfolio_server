"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const config_1 = tslib_1.__importDefault(require("../../config/config"));
const logger_1 = tslib_1.__importDefault(require("../../util/logger"));
if (process.env.DEBUG?.includes('mongoose')) {
    mongoose_1.default.set('debug', true);
}
else {
    mongoose_1.default.set('debug', false);
}
exports.default = {
    connect: async () => {
        try {
            if (!config_1.default.MONGODB_URI) {
                throw new Error('MONGODB_URI is not defined in environment variables');
            }
            const options = {
                autoIndex: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4,
                retryWrites: true,
                w: 'majority'
            };
            logger_1.default.debug('Attempting to connect to MongoDB...', {
                meta: { uri: config_1.default.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') }
            });
            await mongoose_1.default.connect(config_1.default.MONGODB_URI, options);
            logger_1.default.info('✅ MongoDB connected successfully', {
                meta: {
                    host: mongoose_1.default.connection.host,
                    name: mongoose_1.default.connection.name,
                    port: mongoose_1.default.connection.port,
                    dbName: mongoose_1.default.connection.db?.databaseName
                }
            });
            mongoose_1.default.connection.on('disconnected', () => {
                logger_1.default.warn('⚠️ MongoDB disconnected');
            });
            mongoose_1.default.connection.on('error', (err) => {
                logger_1.default.error('❌ MongoDB connection error', { meta: err });
            });
            return mongoose_1.default.connection;
        }
        catch (err) {
            logger_1.default.error('❌ MongoDB connection failed', { meta: err });
            process.exit(1);
        }
    }
};
//# sourceMappingURL=core.database.js.map