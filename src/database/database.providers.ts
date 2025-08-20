import { Pool } from 'pg';
import { CoreConfig } from '../core/core.config';
import { DataSource } from 'typeorm';
import { User } from '../modules/user-accounts/domain/user.entity';
import { EmailConfirmation } from '../modules/user-accounts/domain/emailConfirmation.schema';
import { PasswordRecovery } from '../modules/user-accounts/domain/passwordRecovery.schema';
import { SecurityDevice } from '../modules/user-accounts/domain/device.entity';

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
    },
    {
        provide: DataSource,
        useFactory: async (coreConfig: CoreConfig) => {
            const dataSource = new DataSource({
                type: 'postgres', // or other database type
                host: coreConfig.postgresHost,
                port: coreConfig.postgresPort,
                username: coreConfig.postgresUser,
                password: coreConfig.postgresPassword,
                database: coreConfig.postgresDBName,
                entities: [User, EmailConfirmation, PasswordRecovery, SecurityDevice],
                synchronize: true // false in production
            });
            return await dataSource.initialize();
        },
        inject: [CoreConfig]
    }
];
