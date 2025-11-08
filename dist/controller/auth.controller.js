"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const httpResponse_1 = tslib_1.__importDefault(require("../util/httpResponse"));
const responseMessage_1 = tslib_1.__importDefault(require("../constant/responseMessage"));
const httpError_1 = tslib_1.__importDefault(require("../util/httpError"));
const quicker_1 = tslib_1.__importDefault(require("../util/quicker"));
const auth_validation_1 = require("../validation/auth.validation");
const config_1 = tslib_1.__importDefault(require("../config/config"));
const emailService_1 = tslib_1.__importDefault(require("../service/emailService"));
const logger_1 = tslib_1.__importDefault(require("../util/logger"));
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const application_1 = require("../constant/application");
const auth_database_1 = tslib_1.__importDefault(require("../service/database/auth.database"));
const user_database_1 = tslib_1.__importDefault(require("../service/database/user.database"));
exports.default = {
    register: async (req, res, next) => {
        try {
            const { body } = req;
            if (req.file) {
            }
            const { error, value } = (0, auth_validation_1.validateJoiSchema)(auth_validation_1.ValidateRegisterBody, body);
            if (error) {
                return (0, httpError_1.default)(next, error, req, 422);
            }
            const { name, emailAddress, password, phoneNumber, consent, profile_image } = value;
            const user = await user_database_1.default.findUserByEmailAddress(emailAddress);
            if (user) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.ALREADY_EXIST('user', emailAddress)), req, 403);
            }
            const { countryCode, isoCode, internationalNumber } = quicker_1.default.parsePhoneNumber(`+91` + phoneNumber);
            if (!countryCode || !isoCode || !internationalNumber) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.INVALID_PHONE_NUMBER), req, 422);
            }
            const timezone = quicker_1.default.countryTimezone(isoCode);
            if (!timezone || timezone.length === 0) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.INVALID_PHONE_NUMBER), req, 422);
            }
            const encryptedPassword = await quicker_1.default.hashPassword(password);
            const token = quicker_1.default.generateRandomId();
            const code = quicker_1.default.generateOtp(6);
            const payload = {
                name,
                emailAddress,
                profile_image: profile_image || null,
                phoneNumber: {
                    countryCode: countryCode,
                    isoCode: isoCode,
                    internationalNumber: internationalNumber
                },
                accountConfirmation: {
                    status: false,
                    token,
                    code: code,
                    timestamp: null
                },
                passwordReset: {
                    token: null,
                    expiry: null,
                    lastResetAt: null
                },
                lastLoginAt: null,
                role: 'USER',
                timezone: timezone[0].name,
                password: encryptedPassword,
                consent
            };
            const newUser = await user_database_1.default.registerUser(payload);
            const confirmationUrl = `${config_1.default.CLIENT_URL}/confirmation/${token}?code=${code}`;
            const to = [emailAddress];
            const subject = 'Confirm Your Account';
            const html = await emailService_1.default.renderTemplate('verify_account', {
                name: newUser.name,
                confirmationUrl: confirmationUrl
            });
            emailService_1.default.sendEmail(to, subject, html).catch((err) => {
                logger_1.default.error(`EMAIL_SERVICE`, {
                    meta: err
                });
            });
            (0, httpResponse_1.default)(req, res, 201, responseMessage_1.default.SUCCESS, { _id: newUser._id, user: newUser });
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    confirmation: async (req, res, next) => {
        try {
            const { params, query } = req;
            const { token } = params;
            const { code } = query;
            const user = await user_database_1.default.findUserByConfirmationTokenAndCode(token, code);
            if (!user) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.INVALID_ACCOUNT_CONFIRMATION_TOKEN_OR_CODE), req, 400);
            }
            if (user.accountConfirmation.status) {
                return (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.ACCOUNT_ALREADY_CONFIRMED);
            }
            user.accountConfirmation.status = true;
            user.accountConfirmation.timestamp = (0, dayjs_1.default)().utc().toDate();
            await user.save();
            const to = [user.emailAddress];
            const subject = 'Account Confirmed';
            const html = 'Account has been confirmed successfully';
            emailService_1.default.sendEmail(to, subject, html).catch((err) => {
                logger_1.default.error(`EMAIL_SERVICE`, {
                    meta: err
                });
            });
            (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS);
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    login: async (req, res, next) => {
        try {
            const { body } = req;
            const { error, value } = (0, auth_validation_1.validateJoiSchema)(auth_validation_1.ValidateLoginBody, body);
            if (error) {
                return (0, httpError_1.default)(next, error, req, 422);
            }
            const { emailAddress, password } = value;
            const user = await user_database_1.default.findUserByEmailAddress(emailAddress, `+password`);
            if (!user) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.NOT_FOUND('user')), req, 404);
            }
            if (!user.accountConfirmation.status) {
                const token = quicker_1.default.generateRandomId();
                const code = quicker_1.default.generateOtp(6);
                const confirmationUrl = `${config_1.default.CLIENT_URL}/confirmation/${token}?code=${code}`;
                const to = [emailAddress];
                const subject = 'Confirm Your Account';
                const html = await emailService_1.default.renderTemplate('verify_account', {
                    name: user.name,
                    confirmationUrl: confirmationUrl
                });
                emailService_1.default.sendEmail(to, subject, html).catch((err) => {
                    logger_1.default.error(`EMAIL_SERVICE`, {
                        meta: err
                    });
                });
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.ACCOUNT_CONFIRMATION_REQUIRED), req, 400);
            }
            const isValidPassword = await quicker_1.default.comparePassword(password, user.password);
            if (!isValidPassword) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.INVALID_EMAIL_OR_PASSWORD), req, 400);
            }
            const api_AccessToken = quicker_1.default.generateToken({
                userId: user.id
            }, config_1.default.API_ACCESS_TOKEN_SECRET, 100);
            const api_RefreshToken = quicker_1.default.generateToken({
                userId: user.id
            }, config_1.default.API_REFRESH_TOKEN_SECRET, 100);
            user.lastLoginAt = (0, dayjs_1.default)().utc().toDate();
            await user.save();
            const refreshTokenPayload = {
                token: api_RefreshToken
            };
            await auth_database_1.default.createRefreshToken(refreshTokenPayload);
            const DOMAIN = quicker_1.default.getDomainFromUrl(config_1.default.SERVER_URL);
            res
                .cookie(application_1.EStorageKey.API_ACCESS_TOKEN, api_AccessToken, {
                path: '/',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000,
                httpOnly: false,
                secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
            })
                .cookie(application_1.EStorageKey.API_ACCESS_TOKEN, api_AccessToken, {
                path: '/',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000,
                httpOnly: true,
                secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
            })
                .cookie(application_1.EStorageKey.API_REFRESH_TOKEN, api_RefreshToken, {
                path: '/',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000,
                httpOnly: true,
                secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
            });
            (0, httpResponse_1.default)(req, res, 201, responseMessage_1.default.SUCCESS, { user: user });
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    selfIdentification: async (req, res, next) => {
        try {
            const request = req;
            const { cookies } = request;
            const { apiOnly_AccessToken } = cookies;
            if (!apiOnly_AccessToken) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.INVALID_ACCOUNT_CONFIRMATION_TOKEN_OR_CODE), req, 400);
            }
            const { userId } = quicker_1.default.verifyToken(apiOnly_AccessToken, config_1.default.API_ACCESS_TOKEN_SECRET);
            if (!userId) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.UNAUTHORIZED), req, 401);
            }
            const user = await user_database_1.default.findUserById(userId);
            if (!user) {
                const DOMAIN = quicker_1.default.getDomainFromUrl(config_1.default.SERVER_URL);
                res
                    .clearCookie(application_1.EStorageKey.API_ACCESS_TOKEN, {
                    path: '/',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000,
                    httpOnly: false,
                    secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
                })
                    .clearCookie(application_1.EStorageKey.API_ACCESS_TOKEN, {
                    path: '/',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000,
                    httpOnly: true,
                    secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
                })
                    .clearCookie(application_1.EStorageKey.API_REFRESH_TOKEN, {
                    path: '/',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000,
                    httpOnly: true,
                    secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
                });
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.INVALID_ACCOUNT_CONFIRMATION_TOKEN_OR_CODE), req, 400);
            }
            return (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS, user);
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    logout: async (req, res, next) => {
        try {
            const { cookies } = req;
            const { refreshToken } = cookies;
            if (refreshToken) {
                await auth_database_1.default.deleteRefreshToken(refreshToken);
            }
            const DOMAIN = quicker_1.default.getDomainFromUrl(config_1.default.SERVER_URL);
            res
                .clearCookie(application_1.EStorageKey.API_ACCESS_TOKEN, {
                path: '/',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000,
                httpOnly: false,
                secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
            })
                .clearCookie(application_1.EStorageKey.API_ACCESS_TOKEN, {
                path: '/',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000,
                httpOnly: true,
                secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
            })
                .clearCookie(application_1.EStorageKey.API_REFRESH_TOKEN, {
                path: '/',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000,
                httpOnly: true,
                secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
            });
            (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS);
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    refreshToken: async (req, res, next) => {
        try {
            const { cookies } = req;
            const { apiOnly_RefreshToken } = cookies;
            if (apiOnly_RefreshToken) {
                const rft = await auth_database_1.default.findRefreshToken(apiOnly_RefreshToken);
                if (!rft) {
                    return (0, httpError_1.default)(next, new Error(responseMessage_1.default.INVALID_TOKEN), req, 400);
                }
                const DOMAIN = quicker_1.default.getDomainFromUrl(config_1.default.SERVER_URL);
                let userId = null;
                try {
                    const decryptedJwt = quicker_1.default.verifyToken(apiOnly_RefreshToken, config_1.default.API_REFRESH_TOKEN_SECRET);
                    userId = decryptedJwt.userId;
                }
                catch {
                    userId = null;
                }
                if (userId) {
                    const accessToken = quicker_1.default.generateToken({
                        userId: userId
                    }, config_1.default.API_ACCESS_TOKEN_SECRET, 100);
                    res.cookie(application_1.EStorageKey.API_ACCESS_TOKEN, accessToken, {
                        path: '/',
                        domain: DOMAIN,
                        sameSite: 'strict',
                        maxAge: 1000,
                        httpOnly: true,
                        secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
                    });
                    return (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS, {
                        accessToken
                    });
                }
            }
            (0, httpError_1.default)(next, new Error(responseMessage_1.default.UNAUTHORIZED), req, 401);
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            const { body } = req;
            const { error, value } = (0, auth_validation_1.validateJoiSchema)(auth_validation_1.ValidateForgotPasswordBody, body);
            if (error) {
                return (0, httpError_1.default)(next, error, req, 422);
            }
            const { emailAddress } = value;
            const user = await user_database_1.default.findUserByEmailAddress(emailAddress);
            if (!user) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.NOT_FOUND('user')), req, 404);
            }
            if (!user.accountConfirmation.status) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.ACCOUNT_CONFIRMATION_REQUIRED), req, 400);
            }
            const token = quicker_1.default.generateRandomId();
            const expiry = quicker_1.default.generateResetPasswordExpiry(15);
            user.passwordReset.token = token;
            user.passwordReset.expiry = expiry;
            await user.save();
            const resetUrl = `${config_1.default.CLIENT_URL}/reset-password/${token}`;
            const to = [emailAddress];
            const subject = 'Account Password Reset Requested';
            const html = `Hey ${user.name}, Please reset your account password by clicking on the link below\n\nLink will expire within 15 Minutes\n\n${resetUrl}`;
            emailService_1.default.sendEmail(to, subject, html).catch((err) => {
                logger_1.default.error(`EMAIL_SERVICE`, {
                    meta: err
                });
            });
            (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS);
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    resetPassword: async (req, res, next) => {
        try {
            const { body, params } = req;
            const { token } = params;
            const { error, value } = (0, auth_validation_1.validateJoiSchema)(auth_validation_1.ValidateResetPasswordBody, body);
            if (error) {
                return (0, httpError_1.default)(next, error, req, 422);
            }
            const { newPassword } = value;
            const user = await user_database_1.default.findUserByResetToken(token);
            if (!user) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.NOT_FOUND('user')), req, 404);
            }
            if (!user.accountConfirmation.status) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.ACCOUNT_CONFIRMATION_REQUIRED), req, 400);
            }
            const storedExpiry = user.passwordReset.expiry;
            const currentTimestamp = (0, dayjs_1.default)().valueOf();
            if (!storedExpiry) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.INVALID_REQUEST), req, 400);
            }
            if (currentTimestamp > storedExpiry) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.EXPIRED_URL), req, 400);
            }
            const hashedPassword = await quicker_1.default.hashPassword(newPassword);
            user.password = hashedPassword;
            user.passwordReset.token = null;
            user.passwordReset.expiry = null;
            user.passwordReset.lastResetAt = (0, dayjs_1.default)().utc().toDate();
            await user.save();
            const to = [user.emailAddress];
            const subject = 'Account Password Reset';
            const html = `Hey ${user.name}, You account password has been reset successfully.`;
            emailService_1.default.sendEmail(to, subject, html).catch((err) => {
                logger_1.default.error(`EMAIL_SERVICE`, {
                    meta: err
                });
            });
            (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS);
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    },
    changePassword: async (req, res, next) => {
        try {
            const { body, authenticatedUser } = req;
            const { error, value } = (0, auth_validation_1.validateJoiSchema)(auth_validation_1.ValidateChangePasswordBody, body);
            if (error) {
                return (0, httpError_1.default)(next, error, req, 422);
            }
            const user = await user_database_1.default.findUserById(authenticatedUser._id, '+password');
            if (!user) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.NOT_FOUND('user')), req, 404);
            }
            const { newPassword, oldPassword } = value;
            const isPasswordMatching = await quicker_1.default.comparePassword(oldPassword, user.password);
            if (!isPasswordMatching) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.INVALID_OLD_PASSWORD), req, 400);
            }
            if (newPassword === oldPassword) {
                return (0, httpError_1.default)(next, new Error(responseMessage_1.default.PASSWORD_MATCHING_WITH_OLD_PASSWORD), req, 400);
            }
            const hashedPassword = await quicker_1.default.hashPassword(newPassword);
            user.password = hashedPassword;
            await user.save();
            (0, httpResponse_1.default)(req, res, 200, responseMessage_1.default.SUCCESS);
        }
        catch (err) {
            (0, httpError_1.default)(next, err, req, 500);
        }
    }
};
//# sourceMappingURL=auth.controller.js.map