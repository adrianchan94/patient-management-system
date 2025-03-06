import { resolve } from 'path';
import { createConnection } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { APPLICATION_NAME, CONFIG } from './constant';
import { logger } from './logger';

const dbConfig: PostgresConnectionOptions = {
    url: CONFIG.db.url,
    extra: {
        application_name: APPLICATION_NAME,
    },
    synchronize: false,
    logging: true,
    entities: [
        `${resolve(__dirname, '../entity')}/**.{js,ts}`
    ],
    migrations: [
        `${resolve(__dirname, '../migration')}/**.{js,ts}`
    ],
    subscribers: [
        `${resolve(__dirname, '../subscriber')}/**.{js,ts}`
    ],
    cli: {
        'entitiesDir': resolve(__dirname, '../entity'),
        'migrationsDir': resolve(__dirname, '../migration'),
        'subscribersDir': resolve(__dirname, '../subscriber'),
    },
    cache: false,
    type: 'postgres',
    schema: CONFIG.db.schema,
    maxQueryExecutionTime: 200,
};

export async function initialiseDb(): Promise<void> {
    const connection = await createConnection(dbConfig);
    logger.info(`DB Connection established`);
    await connection.createQueryRunner('master').createSchema(CONFIG.db.schema, true);
    logger.info(`Created schema ${CONFIG.db.schema}`);
    await connection.runMigrations({ transaction: 'each' });
    logger.info(`Migration completed against schema ${CONFIG.db.schema}`);
}
