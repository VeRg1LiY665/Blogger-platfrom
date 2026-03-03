import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GamesSqlQueryRepository } from '../../../infrastructure/games-sql.query.repository';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GameViewDto } from '../../../api/view-dto/game.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetGamesQueryParams } from '../../../api/input-dto/get-gamesquery-params.input-dto';

export class GetMyGamesQuery {
    constructor(
        public queryParams: GetGamesQueryParams,
        public userId: string
    ) {}
}

@QueryHandler(GetMyGamesQuery)
export class GetMyGamesQueryHandler implements IQueryHandler<GetMyGamesQuery> {
    constructor(private gamesSqlQRepository: GamesSqlQueryRepository) {}

    async execute(query: GetMyGamesQuery): Promise<PaginatedViewDto<GameViewDto[]>> {
        const games = await this.gamesSqlQRepository.findAllForUser(query.userId, query.queryParams);
        if (!games) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Games not found',
                extensions: [new Extension('Game not found', 'id')]
            });
        }
        return games;
    }
}
