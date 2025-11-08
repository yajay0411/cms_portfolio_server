"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const refreshTokenModel_1 = tslib_1.__importDefault(require("../../model/refreshTokenModel"));
exports.default = {
    createRefreshToken: (payload) => {
        return refreshTokenModel_1.default.create(payload);
    },
    deleteRefreshToken: (token) => {
        return refreshTokenModel_1.default.deleteOne({ token: token });
    },
    findRefreshToken: (token) => {
        return refreshTokenModel_1.default.findOne({ token });
    }
};
//# sourceMappingURL=auth.database.js.map