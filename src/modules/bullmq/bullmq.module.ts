import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../../database/database.modules';
import { GameFinishProcessor } from './processors/game-finish.processor';
import { GamesSqlRepository } from '../quiz-game/infrastructure/games-sql.repository';

@Module({
    imports: [
        DatabaseModule,

        BullModule.forRootAsync({
            imports: [DatabaseModule],
            useFactory: (redisOptions: any) => ({
                connection: redisOptions,
                prefix: 'bull:'
            }),
            inject: ['REDIS_OPTIONS'] // Inject token & repo
        })
    ],
    providers: [GameFinishProcessor, GamesSqlRepository]
})
export class BullmqModule {}
