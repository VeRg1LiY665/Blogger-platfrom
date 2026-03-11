import { Pool } from 'pg';
import { CoreConfig } from '../core/core.config';
import { DataSource } from 'typeorm';
import { User } from '../modules/user-accounts/domain/user.entity';
import { EmailConfirmation } from '../modules/user-accounts/domain/emailConfirmation.schema';
import { PasswordRecovery } from '../modules/user-accounts/domain/passwordRecovery.schema';
import { SecurityDevice } from '../modules/user-accounts/domain/device.entity';
import { Blog } from '../modules/bloggers-platform/domain/blog.entity';
import { Post } from '../modules/bloggers-platform/domain/post.entity';
import { Comment } from '../modules/bloggers-platform/domain/comment.entity';
import { Like } from '../modules/bloggers-platform/domain/like.entity';
import { GameEntity } from '../modules/quiz-game/domain/game.entity';
import { Question } from '../modules/quiz-game/domain/question.entity';
import { PlayerProgress } from '../modules/quiz-game/domain/playerProgress.entity';
import { Answer } from '../modules/quiz-game/domain/answers.entity';
import { GameQuestion } from '../modules/quiz-game/domain/game-questions.entity';

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
                entities: [
                    Blog,
                    Post,
                    Comment,
                    Like,
                    User,
                    EmailConfirmation,
                    PasswordRecovery,
                    SecurityDevice,
                    GameEntity,
                    Question,
                    PlayerProgress,
                    Answer,
                    GameQuestion
                ],
                synchronize: true, // false in production
                extra: {
                    max: 20,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 2000,
                    keepAlive: true,
                    keepAliveInitialDelayMillis: 10000
                }
            });
            return await dataSource.initialize();
        },
        inject: [CoreConfig]
    }
];
