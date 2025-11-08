"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const refreshTokenSchema = new mongoose_1.default.Schema({
    token: {
        type: String,
        required: true
    }
}, { timestamps: true });
refreshTokenSchema.index({
    createdAt: -1
}, { expireAfterSeconds: 100 });
exports.default = mongoose_1.default.model('refresh-token', refreshTokenSchema);
//# sourceMappingURL=refreshTokenModel.js.map