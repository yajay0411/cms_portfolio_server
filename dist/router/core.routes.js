"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const api_controller_1 = tslib_1.__importDefault(require("../controller/api.controller"));
const rateLimit_1 = tslib_1.__importDefault(require("../middleware/rateLimit"));
const r = (0, express_1.Router)();
r.route('/self').get(rateLimit_1.default, api_controller_1.default.self);
r.route('/health').get(rateLimit_1.default, api_controller_1.default.health);
exports.default = r;
//# sourceMappingURL=core.routes.js.map