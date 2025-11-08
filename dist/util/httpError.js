"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const responseMessage_1 = tslib_1.__importDefault(require("../constant/responseMessage"));
const config_1 = tslib_1.__importDefault(require("../config/config"));
const application_1 = require("../constant/application");
const logger_1 = tslib_1.__importDefault(require("./logger"));
exports.default = (nextFunc, err, req, errorStatusCode = 500) => {
    const errorObj = {
        success: false,
        statusCode: errorStatusCode,
        request: {
            ip: req.ip || null,
            method: req.method,
            url: req.originalUrl,
            user: null
        },
        message: err instanceof Error ? err.message || responseMessage_1.default.SOMETHING_WENT_WRONG : responseMessage_1.default.SOMETHING_WENT_WRONG,
        data: null,
        trace: err instanceof Error ? { error: err.stack } : null
    };
    logger_1.default.error(`CONTROLLER_ERROR_RESPONSE`, {
        meta: errorObj
    });
    if (config_1.default.ENV === application_1.EApplicationEnvironment.PRODUCTION) {
        delete errorObj.request.ip;
        delete errorObj.trace;
    }
    return nextFunc(errorObj);
};
//# sourceMappingURL=httpError.js.map