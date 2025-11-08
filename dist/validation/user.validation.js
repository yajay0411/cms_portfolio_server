"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateUpdateUserBody = void 0;
const tslib_1 = require("tslib");
const joi_1 = tslib_1.__importDefault(require("joi"));
exports.ValidateUpdateUserBody = joi_1.default.object({
    name: joi_1.default.string().min(2).max(72).trim().required(),
    phoneNumber: joi_1.default
        .object({
        isoCode: joi_1.default.string().length(2).trim().required(),
        countryCode: joi_1.default
            .string()
            .pattern(/^\+\d+$/)
            .trim()
            .required(),
        internationalNumber: joi_1.default
            .string()
            .pattern(/^\+\d{1,3}\s\d+$/)
            .trim()
            .required()
    })
        .required(),
    profile_image: joi_1.default
        .string()
        .uri({ scheme: ['https'] })
        .allow(null)
});
//# sourceMappingURL=user.validation.js.map