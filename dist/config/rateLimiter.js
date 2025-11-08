"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRateLimiter = exports.rateLimiterMongo = void 0;
const tslib_1 = require("tslib");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const logger_1 = tslib_1.__importDefault(require("../util/logger"));
const config_1 = tslib_1.__importDefault(require("./config"));
const application_1 = require("../constant/application");
exports.rateLimiterMongo = null;
const DURATION = 60;
const POINTS = config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT ? 20 : 10;
const initRateLimiter = (mongooseConnection) => {
    try {
        exports.rateLimiterMongo = new rate_limiter_flexible_1.RateLimiterMongo({
            storeClient: mongooseConnection,
            points: POINTS,
            duration: DURATION
        });
        logger_1.default.info(`RATE_LIMITER_INITIATED_SUCCESSFULLY`);
    }
    catch (error) {
        logger_1.default.info(`RATE_LIMITER_INITIATED_FAILED`, error);
        exports.rateLimiterMongo = null;
    }
};
exports.initRateLimiter = initRateLimiter;
//# sourceMappingURL=rateLimiter.js.map