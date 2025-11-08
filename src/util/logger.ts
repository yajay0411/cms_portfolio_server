import util from 'node:util';
import 'winston-mongodb';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { red, blue, yellow, green, magenta, italic, cyan } from 'colorette';
import * as sourceMapSupport from 'source-map-support';
import config from '../config/config';
import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
import { MongoDBTransportInstance } from 'winston-mongodb';

sourceMapSupport.install();

// ───────────────────────────────
// 🧩 Environment switch
// ───────────────────────────────
const isLoggingEnabled = process.env.LOGGER === 'true';

// ───────────────────────────────
// 🎨 Helpers for color and format
// ───────────────────────────────
const colorizeLevel = (level: string): string => {
  switch (level.toUpperCase()) {
    case 'ERROR':
      return red(level);
    case 'INFO':
      return blue(level);
    case 'WARN':
      return yellow(level);
    default:
      return level;
  }
};

const consoleLogFormat = format.printf((info) => {
  const { level, message, timestamp, meta = {} } = info;
  return `[${colorizeLevel(level)}] [${green(timestamp as string)}] ${italic(
    cyan(message as string)
  )}\n${magenta('META')} ${util.inspect(meta, { colors: true })}\n`;
});

// ───────────────────────────────
// 🚀 Transport builders
// ───────────────────────────────
const consoleTransport = (): ConsoleTransportInstance[] => [
  new transports.Console({
    level: 'debug',
    format: format.combine(format.timestamp(), consoleLogFormat)
  })
];

const fileTransport = (): DailyRotateFile[] => [
  new DailyRotateFile({
    filename: path.join(__dirname, '../../logs', `${config.ENV}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    maxSize: '10m',
    maxFiles: '30d',
    level: 'info',
    format: format.combine(format.timestamp(), format.json())
  })
];

const mongodbTransport = (): MongoDBTransportInstance[] => {
  return [
    new transports.MongoDB({
      level: 'info',
      db: config.MONGODB_URI,
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

// ───────────────────────────────
// 🧱 Logger instance (conditionally built)
// ───────────────────────────────
const logger = isLoggingEnabled
  ? createLogger({
      defaultMeta: { meta: {} },
      transports: [...fileTransport(), ...mongodbTransport(), ...consoleTransport()],
      exceptionHandlers: [
        new DailyRotateFile({
          filename: path.join(__dirname, '../../logs/exceptions-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxFiles: '15d'
        })
      ],
      rejectionHandlers: [
        new DailyRotateFile({
          filename: path.join(__dirname, '../../logs/rejections-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxFiles: '15d'
        })
      ]
    })
  : // 🧱 Dummy logger (no-logs)
    ({
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {}
    } as unknown as ReturnType<typeof createLogger>);

export default logger;
