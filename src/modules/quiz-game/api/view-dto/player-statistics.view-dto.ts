import { UserStatisticsSqlDto } from '../../infrastructure/dto/user-statistics-sql.dto';

export class UserStatisticsViewDto {
    sumScore: number;
    avgScores: number;
    gamesCount: number;
    winsCount: number;
    lossesCount: number;
    drawsCount: number;

    static mapSqlToView(dto: UserStatisticsSqlDto): UserStatisticsViewDto {
        const result: UserStatisticsViewDto = {
            sumScore: dto.sumScore ? +dto.sumScore : 0,
            avgScores: dto.avgScores
                ? +dto.avgScores % Math.trunc(+dto.avgScores) == 0
                    ? Math.trunc(+dto.avgScores)
                    : +dto.avgScores
                : 0,
            gamesCount: dto.gamesCount ? +dto.gamesCount : 0,
            winsCount: dto.winsCount ? +dto.winsCount : 0,
            lossesCount: dto.lossesCount ? +dto.lossesCount : 0,
            drawsCount: dto.drawsCount ? +dto.drawsCount : 0
        };

        return result;
    }
}
