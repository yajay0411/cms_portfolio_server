"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const quicker_1 = tslib_1.__importDefault(require("../util/quicker"));
const config_1 = tslib_1.__importDefault(require("../config/config"));
const httpError_1 = tslib_1.__importDefault(require("../util/httpError"));
const responseMessage_1 = tslib_1.__importDefault(require("../constant/responseMessage"));
const user_database_1 = tslib_1.__importDefault(require("../service/database/user.database"));
exports.default = async (request, _res, next) => {
    try {
        const req = request;
        const { cookies } = req;
        const { apiOnly_AccessToken } = cookies;
        if (apiOnly_AccessToken) {
            try {
                const { userId } = quicker_1.default.verifyToken(apiOnly_AccessToken, config_1.default.API_ACCESS_TOKEN_SECRET);
                if (!userId) {
                    return (0, httpError_1.default)(next, new Error(responseMessage_1.default.UNAUTHORIZED), req, 401);
                }
                const user = await user_database_1.default.findUserById(userId);
                if (user) {
                    req.authenticatedUser = user;
                    return next();
                }
            }
            catch {
                (0, httpError_1.default)(next, new Error(responseMessage_1.default.INVALID_ACCOUNT_CONFIRMATION_TOKEN_OR_CODE), req, 401);
            }
        }
        (0, httpError_1.default)(next, new Error(responseMessage_1.default.UNAUTHORIZED), req, 401);
    }
    catch (err) {
        (0, httpError_1.default)(next, err, request, 500);
    }
};
//# sourceMappingURL=authentication.js.map