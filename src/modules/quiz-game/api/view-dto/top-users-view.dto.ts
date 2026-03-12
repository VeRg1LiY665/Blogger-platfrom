import { UserStatisticsViewDto } from './player-statistics.view-dto';
import { TopPlayersSqlDto } from '../../infrastructure/dto/top-players-sql.dto';

export class TopUsersViewDto extends UserStatisticsViewDto {
    player: {
        id: string;
        login: string;
    };

    static mapSqlToView(dto: TopPlayersSqlDto): TopUsersViewDto {
        const result: TopUsersViewDto = {
            sumScore: dto.sumScore ? +dto.sumScore : 0,
            avgScores: dto.avgScores
                ? +dto.avgScores % Math.trunc(+dto.avgScores) == 0
                    ? Math.trunc(+dto.avgScores)
                    : +dto.avgScores
                : 0,
            gamesCount: dto.gamesCount ? +dto.gamesCount : 0,
            winsCount: dto.winsCount ? +dto.winsCount : 0,
            lossesCount: dto.lossesCount ? +dto.lossesCount : 0,
            drawsCount: dto.drawsCount ? +dto.drawsCount : 0,
            player: {
                id: dto.id,
                login: dto.login
            }
        };

        return result;
    }
}
