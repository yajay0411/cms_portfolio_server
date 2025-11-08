"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const auth_validation_1 = require("../validation/auth.validation");
const user_validation_1 = require("../validation/user.validation");
const httpError_1 = tslib_1.__importDefault(require("../util/httpError"));
const responseMessage_1 = tslib_1.__importDefault(require("../constant/responseMessage"));
const httpResponse_1 = tslib_1.__importDefault(require("../util/httpResponse"));
const user_database_1 = tslib_1.__importDefault(require("../service/database/user.database"));
exports.default = {
    getAllUsers: async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 0;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const sortField = req.query.sortField || 'createdAt';
            const sortOrder = req.query.sortOrder || 'desc';
            const searchTerm = req.query.searchTerm;
            const role = req.query.role;
            const query = {};
            if (searchTerm) {
                query.$or = [{ name: { $regex: searchTerm, $options: 'i' } }, { emailAddress: { $regex: searchTerm, $options: 'i' } }];
            }
            if (role) {
                query.role = role;
            }
            const totalCount = await user_database_1.default.getAllUsersCount(query);
            const users = await user_database_1.default
                .getAllUsers(query)
                .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
                .skip(page * pageSize)
                .limit(pageSize)
                .select('-password');
            if (!users || users.length === 0) {
                return (0, httpResponse_1.default)(req, res, 404, responseMessage_1.default.NOT_FOUND('Users'));
            }
            (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS, {
                items: users,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize)
            });
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    getUserDetails: async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!id) {
                return (0, httpResponse_1.default)(req, res, 404, responseMessage_1.default.INVALID_REQUEST);
            }
            const user = await user_database_1.default.findUserById(id);
            if (!user) {
                return (0, httpResponse_1.default)(req, res, 404, responseMessage_1.default.NOT_FOUND('User'));
            }
            const userResponse = {
                ...user.toObject(),
                password: undefined,
                accountConfirmation: undefined,
                passwordReset: undefined
            };
            (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS, userResponse);
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    updateUser: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { body } = req;
            if (req.file) {
            }
            const { error, value } = (0, auth_validation_1.validateJoiSchema)(user_validation_1.ValidateUpdateUserBody, body);
            if (error) {
                return (0, httpError_1.default)(next, error, req, 422);
            }
            const user = await user_database_1.default.findUserById(id);
            if (!user) {
                return (0, httpResponse_1.default)(req, res, 404, responseMessage_1.default.NOT_FOUND('User'));
            }
            const { name, phoneNumber, profile_image } = value;
            const payload = {
                name,
                phoneNumber,
                profile_image: profile_image || user.profile_image || null
            };
            const updatedUser = await user_database_1.default.updateUser(id, payload);
            if (!updatedUser) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.NOT_FOUND('User')), req, 404);
            }
            (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS, { message: 'User updated successfully' });
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    deleteUser: async (req, res, next) => {
        try {
            const { id } = req.params;
            const deletedUser = await user_database_1.default.deleteUser(id);
            if (!deletedUser) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.NOT_FOUND('User')), req, 404);
            }
            (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS, { message: 'User deleted successfully' });
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    }
};
//# sourceMappingURL=user.controller.js.map