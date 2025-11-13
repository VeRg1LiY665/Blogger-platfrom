import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GamesSqlQueryRepository } from '../../../infrastructure/games-sql.query.repository';
import { GetGameDto } from '../../../dto/get-game.dto';

export class GetGameByIdQuery {
    constructor(public dto: GetGameDto) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameByIdQueryHandler implements IQueryHandler<GetGameByIdQuery> {
    constructor(private gamesSqlQRepository: GamesSqlQueryRepository) {}

    async execute({ dto }: GetGameByIdQuery) {
        const game = await this.gamesSqlQRepository.findById(dto.gameId);
        if (!game) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Game not found',
                extensions: [new Extension('Game not found', 'id')]
            });
        }

        if (game.firstPlayerProgress.player.id == dto.userId || game.secondPlayerProgress?.player.id == dto.userId) {
            return game;
        } else {
            throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: 'Data acquired not accessible',
                extensions: [new Extension('Game does not belong to the user', 'userId')]
            });
        }
    }
}
