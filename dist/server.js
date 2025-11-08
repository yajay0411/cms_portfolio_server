"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const app_1 = tslib_1.__importDefault(require("./app"));
const config_1 = tslib_1.__importDefault(require("./config/config"));
const rateLimiter_1 = require("./config/rateLimiter");
const core_database_1 = tslib_1.__importDefault(require("./service/database/core.database"));
const logger_1 = tslib_1.__importDefault(require("./util/logger"));
const server = app_1.default.listen(config_1.default.PORT);
(async () => {
    try {
        const connection = await core_database_1.default.connect();
        logger_1.default.info(`DATABASE_CONNECTED_SUCCESSFULLY`, {
            meta: {
                CONNECTION_NAME: connection.name
            }
        });
        (0, rateLimiter_1.initRateLimiter)(connection);
        logger_1.default.info(`APPLICATION_STARTED_SUCCESSFULLY`, {
            meta: {
                PORT: config_1.default.PORT,
                SERVER_URL: config_1.default.SERVER_URL
            }
        });
    }
    catch (err) {
        logger_1.default.error(`APPLICATION_ERROR`, { meta: err });
        server.close((error) => {
            if (error) {
                logger_1.default.error(`APPLICATION_ERROR`, { meta: error });
            }
            process.exit(1);
        });
    }
})();
//# sourceMappingURL=server.js.map