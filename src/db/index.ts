import { DataSource } from 'typeorm';

import { ArchipelagoPlayer } from './models/archipelagoPlayer';
import { ArchipelagoSession } from './models/archipelagoSession';
import { ArchipelagoPlayerGame } from './models/archipelagoPlayerGame';
import { ArchipelagoSessionPlayer } from './models/archipelagoSessionPlayer';
// import { TypeORMWinstonLogger } from './winston-logger';
import { createScopedLogger } from '../logger';

export const logger = createScopedLogger('DB');

export const DB = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    // logger: new TypeORMWinstonLogger(),
    entities: [
        ArchipelagoPlayer,
        ArchipelagoPlayerGame,
        ArchipelagoSession,
        ArchipelagoSessionPlayer,
    ],
    subscribers: [],
    migrations: [],
});

/**
 * Initialize and connect to the database.
 */
export async function initDB(): Promise<void> {
    try {
        logger.info('Connecting to database...');

        await DB.initialize();

        logger.info('Connected.');
    } catch (error) {
        logger.error(error);
    }
}
