"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json(err);
};
//# sourceMappingURL=globalErrorHandler.js.map