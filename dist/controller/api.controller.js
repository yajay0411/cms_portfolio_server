"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const httpResponse_1 = tslib_1.__importDefault(require("../util/httpResponse"));
const responseMessage_1 = tslib_1.__importDefault(require("../constant/responseMessage"));
const httpError_1 = tslib_1.__importDefault(require("../util/httpError"));
const quicker_1 = tslib_1.__importDefault(require("../util/quicker"));
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const utc_1 = tslib_1.__importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
exports.default = {
    self: (req, res, next) => {
        try {
            (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS);
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    health: (req, res, next) => {
        try {
            const healthData = {
                application: quicker_1.default.getApplicationHealth(),
                system: quicker_1.default.getSystemHealth(),
                timestamp: Date.now()
            };
            (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS, healthData);
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    }
};
//# sourceMappingURL=api.controller.js.map