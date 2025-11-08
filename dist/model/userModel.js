"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const userConstant_1 = require("../constant/userConstant");
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        minlength: 2,
        maxlength: 72,
        required: true
    },
    emailAddress: {
        type: String,
        unique: true,
        required: true
    },
    phoneNumber: {
        _id: false,
        isoCode: {
            type: String,
            required: true
        },
        countryCode: {
            type: String,
            required: true
        },
        internationalNumber: {
            type: String,
            required: true
        }
    },
    timezone: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    profile_image: {
        type: String,
        required: false,
        default: null
    },
    role: {
        type: String,
        default: userConstant_1.EUserRole.USER,
        enum: userConstant_1.EUserRole,
        required: true
    },
    accountConfirmation: {
        _id: false,
        status: {
            type: Boolean,
            default: false,
            required: true
        },
        token: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: null
        }
    },
    passwordReset: {
        _id: false,
        token: {
            type: String,
            default: null
        },
        expiry: {
            type: Number,
            default: null
        },
        lastResetAt: {
            type: Date,
            default: null
        }
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    consent: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('user', userSchema);
//# sourceMappingURL=userModel.js.map