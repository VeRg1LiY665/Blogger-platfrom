import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GamesSqlQueryRepository } from '../../../infrastructure/games-sql.query.repository';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GameViewDto } from '../../../api/view-dto/game.view-dto';

export class GetCurrentGameQuery {
    constructor(public userId: string) {}
}

@QueryHandler(GetCurrentGameQuery)
export class GetCurrentGameQueryHandler implements IQueryHandler<GetCurrentGameQuery> {
    constructor(private gamesSqlQRepository: GamesSqlQueryRepository) {}

    async execute(query: GetCurrentGameQuery): Promise<GameViewDto> {
        const game = await this.gamesSqlQRepository.findActiveForUser(query.userId);
        if (!game) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Game not found',
                extensions: [new Extension('Game not found', 'id')]
            });
        }
        return game;
    }
}
