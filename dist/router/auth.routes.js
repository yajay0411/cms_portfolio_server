"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const auth_controller_1 = tslib_1.__importDefault(require("../controller/auth.controller"));
const authentication_1 = tslib_1.__importDefault(require("../middleware/authentication"));
const rateLimit_1 = tslib_1.__importDefault(require("../middleware/rateLimit"));
const router = (0, express_1.Router)();
router.route('/register').post(rateLimit_1.default, auth_controller_1.default.register);
router.route('/confirmation/:token').put(rateLimit_1.default, auth_controller_1.default.confirmation);
router.route('/login').post(rateLimit_1.default, auth_controller_1.default.login);
router.route('/logout').put(rateLimit_1.default, authentication_1.default, auth_controller_1.default.logout);
router.route('/self-identification').get(auth_controller_1.default.selfIdentification);
router.route('/refresh-token').get(rateLimit_1.default, auth_controller_1.default.refreshToken);
router.route('/forgot-password').put(rateLimit_1.default, auth_controller_1.default.forgotPassword);
router.route('/reset-password/:token').put(rateLimit_1.default, auth_controller_1.default.resetPassword);
router.route('/change-password').put(rateLimit_1.default, authentication_1.default, auth_controller_1.default.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map