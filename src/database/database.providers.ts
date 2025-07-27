//import * as mongoose from 'mongoose';
import { Pool } from 'pg';
import { CoreConfig } from '../core/core.config';

export const databaseProviders = [
    /*{
        provide: 'DATABASE_CONNECTION',
        useFactory: (): Promise<typeof mongoose> => mongoose.connect('mongodb://localhost:27017/blogs-platform')
    },*/
    {
        provide: 'PG_POOL',
        useFactory: async (coreConfig: CoreConfig) => {
            const databaseConfig = {
                host: coreConfig.postgresHost,
                port: coreConfig.postgresPort,
                user: coreConfig.postgresUser,
                password: coreConfig.postgresPassword,
                database: coreConfig.postgresDBName
            };
            const pool = new Pool(databaseConfig);
            await pool.connect();
            pool.on('error', (err) => {
                console.error('Unexpected PG client error', err);
                throw new Error(err.message); //throw 500 error //TODO Add infrastructure exception filter?
            });
            return pool;
        },
        inject: [CoreConfig]
    }
];
