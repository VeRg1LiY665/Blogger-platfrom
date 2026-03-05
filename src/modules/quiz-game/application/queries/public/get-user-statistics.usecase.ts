import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GamesSqlQueryRepository } from '../../../infrastructure/games-sql.query.repository';
import { UserStatisticsViewDto } from '../../../api/view-dto/player-statistics.view-dto';

export class GetMyStatisticsQuery {
    constructor(public userId: string) {}
}

@QueryHandler(GetMyStatisticsQuery)
export class GetMyStatisticsQueryHandler implements IQueryHandler<GetMyStatisticsQuery> {
    constructor(private gamesSqlQRepository: GamesSqlQueryRepository) {}

    async execute(query: GetMyStatisticsQuery): Promise<UserStatisticsViewDto> {
        const data = await this.gamesSqlQRepository.getStatisticsData(query.userId);

        return data;
    }
}
