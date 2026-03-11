import { SortDirection } from '../../../../core/dto/base.query-params.input-dto';

export enum TopUsersSortByParams {
    sumScore = 'sumScore',
    avgScores = 'avgScores',
    gamesCount = 'gamesCount',
    winsCount = 'winsCount',
    lossesCount = 'lossesCount',
    drawsCount = 'drawsCount'
}

export type TopUsersSortBy = {
    [key in TopUsersSortByParams]: SortDirection;
};
