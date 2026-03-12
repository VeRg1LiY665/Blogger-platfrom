import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GamesSqlQueryRepository } from '../../../infrastructure/games-sql.query.repository';
import { GetTopUsersQueryParams } from '../../../api/input-dto/get-top-users-query-params.dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { UserStatisticsViewDto } from '../../../api/view-dto/player-statistics.view-dto';

export class GetTopUsersQuery {
    constructor(public queryParams: GetTopUsersQueryParams) {}
}

@QueryHandler(GetTopUsersQuery)
export class GetTopUsersQueryHandler implements IQueryHandler<GetTopUsersQuery> {
    constructor(private gamesSqlQRepository: GamesSqlQueryRepository) {}

    async execute(query: GetTopUsersQuery): Promise<PaginatedViewDto<UserStatisticsViewDto[]>> {
        const topUsers = await this.gamesSqlQRepository.getTopUsers(query.queryParams);
        return topUsers;
    }
}
