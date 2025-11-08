"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const os_1 = tslib_1.__importDefault(require("os"));
const config_1 = tslib_1.__importDefault(require("../config/config"));
exports.default = {
    getSystemHealth: () => {
        return {
            cpuUsage: os_1.default.loadavg(),
            totalMemory: `${(os_1.default.totalmem() / 1024 / 1024).toFixed(2)} MB`,
            freeMemory: `${(os_1.default.freemem() / 1024 / 1024).toFixed(2)} MB`
        };
    },
    getApplicationHealth: () => {
        return {
            environment: config_1.default.ENV,
            uptime: `${process.uptime().toFixed(2)} Second`,
            memoryUsage: {
                heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
            }
        };
    }
};
//# sourceMappingURL=quicker.js.map