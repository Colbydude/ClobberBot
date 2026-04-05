import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf } = format;

const withFallbackLabel = format((info) => {
    if (!info.label) {
        info.label = 'ClobberBot';
    }
    return info;
});

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `[${timestamp}][${label}][${level.toUpperCase()}]: ${message}`;
});

const logger = createLogger({
    level: 'debug',
    format: combine(timestamp(), withFallbackLabel(), myFormat),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: 'logs/clobberbot.log',
            level: 'debug',
            maxsize: 1000000, // Max file size in bytes before rotating
            maxFiles: 5, // Max number of rotated log files
        }),
    ],
});

export function createScopedLogger(label: string) {
    return logger.child({ label });
}

export default logger;
