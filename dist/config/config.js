"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const joi_1 = tslib_1.__importDefault(require("joi"));
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const envVarsSchema = joi_1.default.object({
    NODE_ENV: joi_1.default.string().valid('development', 'production').default('development'),
    PORT: joi_1.default.number().default(8080),
    SERVER_URL: joi_1.default.string().uri().default('http://localhost:8080'),
    CLIENT_URL: joi_1.default.string().uri().default('http://localhost:3000'),
    MONGODB_URI: joi_1.default.string().required().description('MongoDB connection string is required'),
    SEND_GRID_API_SECRET: joi_1.default.string().required().description('SendGrid API key is required'),
    EMAIL_FROM: joi_1.default.string().email().default('noreply@example.com'),
    API_ACCESS_TOKEN_SECRET: joi_1.default.string().min(32).required().description('API access token secret is required (min 32 chars)'),
    API_REFRESH_TOKEN_SECRET: joi_1.default.string().min(32).required().description('API refresh token secret is required (min 32 chars)')
}).unknown(true);
const { value: envVars, error } = envVarsSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
});
if (error) {
    console.error('Environment variables validation failed:');
    error.details.forEach((detail) => {
        console.error(`- ${detail.message}`);
    });
    process.exit(1);
}
const config = Object.freeze({
    ENV: envVars.NODE_ENV,
    PORT: Number(envVars.PORT),
    SERVER_URL: envVars.SERVER_URL,
    CLIENT_URL: envVars.CLIENT_URL,
    SEND_GRID_API_SECRET: envVars.SEND_GRID_API_SECRET,
    EMAIL_FROM: envVars.EMAIL_FROM,
    MONGODB_URI: envVars.MONGODB_URI,
    API_ACCESS_TOKEN_SECRET: envVars.API_ACCESS_TOKEN_SECRET,
    API_REFRESH_TOKEN_SECRET: envVars.API_REFRESH_TOKEN_SECRET
});
if (process.env.NODE_ENV === 'development') {
    console.table(config);
}
exports.default = config;
//# sourceMappingURL=config.js.map