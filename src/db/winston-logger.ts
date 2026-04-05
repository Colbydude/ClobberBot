import { Logger, QueryRunner } from 'typeorm';

import appLogger from '../logger';

export class TypeORMWinstonLogger implements Logger {
    private logger = appLogger.child({ label: 'TypeORM' });

    logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner) {
        this.logger.info(
            `Query: ${query}${parameters?.length ? ' -- Parameters: ' + JSON.stringify(parameters) : ''}`,
        );
    }

    logQueryError(error: string, query: string, parameters?: any[], _queryRunner?: QueryRunner) {
        this.logger.error(
            `Query Failed: ${query}${parameters?.length ? ' -- Parameters: ' + JSON.stringify(parameters) : ''} -- Error: ${error}`,
        );
    }

    logQuerySlow(time: number, query: string, parameters?: any[], _queryRunner?: QueryRunner) {
        this.logger.warn(
            `Slow Query (${time}ms): ${query}${parameters?.length ? ' -- Parameters: ' + JSON.stringify(parameters) : ''}`,
        );
    }

    logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
        this.logger.info(`Schema Build: ${message}`);
    }

    logMigration(message: string, _queryRunner?: QueryRunner) {
        this.logger.info(`Migration: ${message}`);
    }

    log(level: 'log' | 'info' | 'warn', message: any, _queryRunner?: QueryRunner) {
        switch (level) {
            case 'log':
            case 'info':
                this.logger.info(message);
                break;
            case 'warn':
                this.logger.warn(message);
                break;
        }
    }
}
