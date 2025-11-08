"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const core_routes_1 = tslib_1.__importDefault(require("./core.routes"));
const r = (0, express_1.Router)();
r.use('/', core_routes_1.default);
exports.default = r;
//# sourceMappingURL=api.routes.js.map