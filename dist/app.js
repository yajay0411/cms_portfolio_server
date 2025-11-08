"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const path_1 = tslib_1.__importDefault(require("path"));
const api_routes_1 = tslib_1.__importDefault(require("./router/api.routes"));
const globalErrorHandler_1 = tslib_1.__importDefault(require("./middleware/globalErrorHandler"));
const responseMessage_1 = tslib_1.__importDefault(require("./constant/responseMessage"));
const httpError_1 = tslib_1.__importDefault(require("./util/httpError"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const config_1 = tslib_1.__importDefault(require("./config/config"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            ...helmet_1.default.contentSecurityPolicy.getDefaultDirectives(),
            'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            'style-src': ["'self'", "'unsafe-inline'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    origin: [config_1.default.CLIENT_URL],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../', 'public')));
app.use('/api/v1', api_routes_1.default);
app.get('/', (_req, res) => {
    res.send(`SERVER IS RUNNING: ${config_1.default.SERVER_URL}`);
});
app.use((req, _, next) => {
    try {
        throw new Error(responseMessage_1.default.NOT_FOUND('route'));
    }
    catch (err) {
        (0, httpError_1.default)(next, err, req, 404);
    }
});
app.use(globalErrorHandler_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map