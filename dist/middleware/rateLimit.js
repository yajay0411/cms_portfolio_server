"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rateLimiter_1 = require("../config/rateLimiter");
const httpError_1 = tslib_1.__importDefault(require("../util/httpError"));
const responseMessage_1 = tslib_1.__importDefault(require("../constant/responseMessage"));
exports.default = (req, _, next) => {
    if (rateLimiter_1.rateLimiterMongo) {
        rateLimiter_1.rateLimiterMongo
            .consume(req.ip, 1)
            .then(() => {
            next();
        })
            .catch(() => {
            (0, httpError_1.default)(next, new Error(responseMessage_1.default.TOO_MANY_REQUESTS), req, 429);
        });
    }
};
//# sourceMappingURL=rateLimit.js.map