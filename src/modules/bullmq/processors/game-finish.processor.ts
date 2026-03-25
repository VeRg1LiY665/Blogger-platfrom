import { JOB_REF, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GameEntity } from '../../quiz-game/domain/game.entity';
import { GamesSqlRepository } from '../../quiz-game/infrastructure/games-sql.repository';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { GameFinishWithDelayDto } from '../dto/game-finish-with-delay.dto';
import { Inject, Scope } from '@nestjs/common';

@Processor({ name: 'finishGameWithDelay', scope: Scope.REQUEST })
export class GameFinishProcessor extends WorkerHost {
    constructor(
        @Inject(JOB_REF) private readonly job: Job,
        private gamesSqlRepository: GamesSqlRepository
    ) {
        super();
    }
    async process() {
        const gameData = this.job.data as GameFinishWithDelayDto;

        const game: GameEntity | null = await this.gamesSqlRepository.findActiveByPlayer(gameData.userId);
        if (!game) {
            await this.job.remove();
            /*throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: 'User does not participate in game'
            });*/ // TODO cancel job вместо доменной ошибки?
        } else {
            game.finishGame(gameData.firstFinished);

            game.countTotalNumberOfAnswers();

            await this.gamesSqlRepository.save(game);
        }

        //console.log(`Game ${game.id} finished after 10s delay`);
    }
}
