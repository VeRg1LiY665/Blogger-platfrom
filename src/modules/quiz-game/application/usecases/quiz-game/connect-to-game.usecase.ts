import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesSqlRepository } from '../../../infrastructure/games-sql.repository';
import { GameConnectionDto } from '../../../dto/game-connection.dto';
import { UsersExtSqlQRepository } from '../../../../user-accounts/infrastructure/external-query/users.external-sql-query-repository';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GameEntity } from '../../../domain/game.entity';
import { GameQuestionsFactory } from '../../factories/game-questions.factory';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

export class ConnectToGameCommand {
    constructor(public dto: GameConnectionDto) {}
}

/**
 * Создание новой игры/подключение к существующей игре
 */

@CommandHandler(ConnectToGameCommand)
export class ConnectToGameUseCase implements ICommandHandler<ConnectToGameCommand, string> {
    constructor(
        private gamesSqlRepository: GamesSqlRepository,
        private usersExtSqlQRepository: UsersExtSqlQRepository,
        private gameQuestionsFactory: GameQuestionsFactory
    ) {}

    async execute({ dto }: ConnectToGameCommand): Promise<string> {
        const user = await this.usersExtSqlQRepository.findById(dto.userId);
        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'User not found'
            });
        }

        const Agame = await this.gamesSqlRepository.findActiveByPlayer(dto.userId);
        if (Agame) {
            throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: 'User already participates in game'
            });
        }

        const Pgame = await this.gamesSqlRepository.findPendingGame();
        if (Pgame) {
            const dto = {
                userId: user.userId,
                userLogin: user.login
            };
            Pgame.addPlayer(dto);
            return Pgame.id;
        } else {
            const questions = await this.gameQuestionsFactory.create();
            const dto = {
                userId: user.userId,
                userLogin: user.login,
                questions: questions
            };
            const newGame = GameEntity.createInstance(dto);

            const gameId = await this.gamesSqlRepository.save(newGame);
            return gameId;
        }
    }
}
