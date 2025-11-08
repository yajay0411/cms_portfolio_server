"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const config_1 = tslib_1.__importDefault(require("../config/config"));
const application_1 = require("../constant/application");
const logger_1 = tslib_1.__importDefault(require("./logger"));
exports.default = (req, res, responseStatusCode, responseMessage, data = null) => {
    const response = {
        success: true,
        statusCode: responseStatusCode,
        request: {
            ip: req.ip || null,
            method: req.method,
            url: req.originalUrl,
            user: null
        },
        message: responseMessage,
        data: data
    };
    logger_1.default.info(`CONTROLLER_SUCCESS_RESPONSE`, {
        meta: response
    });
    if (config_1.default.ENV === application_1.EApplicationEnvironment.PRODUCTION) {
        delete response.request.ip;
    }
    res.status(responseStatusCode).json(response);
};
//# sourceMappingURL=httpResponse.js.map