"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const userModel_1 = tslib_1.__importDefault(require("../../model/userModel"));
exports.default = {
    findUserByEmailAddress: (emailAddress, select = '') => {
        return userModel_1.default
            .findOne({
            emailAddress
        })
            .select(select);
    },
    registerUser: (payload) => {
        return userModel_1.default.create(payload);
    },
    findUserById: (id, select = '') => {
        return userModel_1.default.findById(id).select(select);
    },
    findUserByConfirmationTokenAndCode: (token, code) => {
        return userModel_1.default.findOne({
            'accountConfirmation.token': token,
            'accountConfirmation.code': code
        });
    },
    findUserByResetToken: (token) => {
        return userModel_1.default.findOne({
            'passwordReset.token': token
        });
    },
    getAllUsersCount: (query) => {
        return userModel_1.default.countDocuments(query).lean();
    },
    getAllUsers: (query) => {
        return userModel_1.default.find(query).lean();
    },
    updateUser: (id, payload) => {
        return userModel_1.default.findByIdAndUpdate(id, payload, { new: true }).lean();
    },
    deleteUser: (id) => {
        return userModel_1.default.findByIdAndDelete(id).lean();
    }
};
//# sourceMappingURL=user.database.js.map