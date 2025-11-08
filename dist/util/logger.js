"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_util_1 = tslib_1.__importDefault(require("node:util"));
require("winston-mongodb");
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = tslib_1.__importDefault(require("winston-daily-rotate-file"));
const path_1 = tslib_1.__importDefault(require("path"));
const colorette_1 = require("colorette");
const sourceMapSupport = tslib_1.__importStar(require("source-map-support"));
const config_1 = tslib_1.__importDefault(require("../config/config"));
sourceMapSupport.install();
const isLoggingEnabled = process.env.LOGGER === 'true';
const colorizeLevel = (level) => {
    switch (level.toUpperCase()) {
        case 'ERROR':
            return (0, colorette_1.red)(level);
        case 'INFO':
            return (0, colorette_1.blue)(level);
        case 'WARN':
            return (0, colorette_1.yellow)(level);
        default:
            return level;
    }
};
const consoleLogFormat = winston_1.format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info;
    return `[${colorizeLevel(level)}] [${(0, colorette_1.green)(timestamp)}] ${(0, colorette_1.italic)((0, colorette_1.cyan)(message))}\n${(0, colorette_1.magenta)('META')} ${node_util_1.default.inspect(meta, { colors: true })}\n`;
});
const consoleTransport = () => [
    new winston_1.transports.Console({
        level: 'debug',
        format: winston_1.format.combine(winston_1.format.timestamp(), consoleLogFormat)
    })
];
const fileTransport = () => [
    new winston_daily_rotate_file_1.default({
        filename: path_1.default.join(__dirname, '../../logs', `${config_1.default.ENV}-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '30d',
        level: 'info',
        format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json())
    })
];
const mongodbTransport = () => {
    return [
        new winston_1.transports.MongoDB({
            level: 'info',
            db: config_1.default.MONGODB_URI,
            metaKey: 'meta',
            collection: 'application-logs',
            tryReconnect: true,
            options: {
                retryWrites: true,
                writeConcern: { w: 'majority' }
            }
        })
    ];
};
const logger = isLoggingEnabled
    ? (0, winston_1.createLogger)({
        defaultMeta: { meta: {} },
        transports: [...fileTransport(), ...mongodbTransport(), ...consoleTransport()],
        exceptionHandlers: [
            new winston_daily_rotate_file_1.default({
                filename: path_1.default.join(__dirname, '../../logs/exceptions-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxFiles: '15d'
            })
        ],
        rejectionHandlers: [
            new winston_daily_rotate_file_1.default({
                filename: path_1.default.join(__dirname, '../../logs/rejections-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxFiles: '15d'
            })
        ]
    })
    :
        {
            info: () => { },
            warn: () => { },
            error: () => { },
            debug: () => { }
        };
exports.default = logger;
//# sourceMappingURL=logger.js.map