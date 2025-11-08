"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJoiSchema = exports.ValidateChangePasswordBody = exports.ValidateResetPasswordBody = exports.ValidateForgotPasswordBody = exports.ValidateLoginBody = exports.ValidateRegisterBody = void 0;
const tslib_1 = require("tslib");
const joi_1 = tslib_1.__importDefault(require("joi"));
exports.ValidateRegisterBody = joi_1.default.object({
    name: joi_1.default.string().min(2).max(72).trim().required(),
    emailAddress: joi_1.default.string().email().trim().required(),
    phoneNumber: joi_1.default.string().min(4).max(20).trim().required(),
    password: joi_1.default.string().min(8).max(24).trim().required(),
    consent: joi_1.default.boolean().valid(true).required(),
    profile_image: joi_1.default
        .string()
        .uri({ scheme: ['https'] })
        .allow(null)
});
exports.ValidateLoginBody = joi_1.default.object({
    emailAddress: joi_1.default.string().email().trim().required(),
    password: joi_1.default.string().min(8).max(24).trim().required()
});
exports.ValidateForgotPasswordBody = joi_1.default.object({
    emailAddress: joi_1.default.string().email().trim().required()
});
exports.ValidateResetPasswordBody = joi_1.default.object({
    newPassword: joi_1.default.string().min(8).max(24).trim().required()
});
exports.ValidateChangePasswordBody = joi_1.default.object({
    oldPassword: joi_1.default.string().min(8).max(24).trim().required(),
    newPassword: joi_1.default.string().min(8).max(24).trim().required(),
    confirmNewPassword: joi_1.default.string().min(8).max(24).trim().valid(joi_1.default.ref('newPassword')).required()
});
const validateJoiSchema = (schema, value) => {
    const result = schema.validate(value);
    return {
        value: result.value,
        error: result.error
    };
};
exports.validateJoiSchema = validateJoiSchema;
//# sourceMappingURL=auth.validation.js.map