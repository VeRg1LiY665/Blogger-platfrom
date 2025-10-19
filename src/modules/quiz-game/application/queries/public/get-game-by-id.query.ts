import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GamesSqlQueryRepository } from '../../../infrastructure/games-sql.query.repository';

export class GetGameByIdQuery {
    constructor(public gameId: string) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameByIdQueryHandler implements IQueryHandler<GetGameByIdQuery> {
    constructor(private gamesSqlQRepository: GamesSqlQueryRepository) {}

    async execute(query: GetGameByIdQuery) {
        const game = await this.gamesSqlQRepository.findById(query.gameId);
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
