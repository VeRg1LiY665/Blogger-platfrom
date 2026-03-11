import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GameEntity } from '../domain/game.entity';
import { GameViewDto } from '../api/view-dto/game.view-dto';
import { Answer } from '../domain/answers.entity';
import { GameQuestion } from '../domain/game-questions.entity';
import { GameStatus } from '../domain/constants/game-status.constants';
import { PlayerProgress } from '../domain/playerProgress.entity';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { calculateRows } from './utils/total-number-of-rows.calculation';
import { GetGamesQueryParams } from '../api/input-dto/get-gamesquery-params.input-dto';
import { UserStatisticsViewDto } from '../api/view-dto/player-statistics.view-dto';
import { GameResult } from '../domain/constants/game-result.constants';
import { UserStatisticsSqlDto } from './dto/user-statistics-sql.dto';
import { GamesSortBy } from '../api/input-dto/games-sort-by';
import { GetTopUsersQueryParams } from '../api/input-dto/get-top-users-query-params.dto';

@Injectable()
export class GamesSqlQueryRepository {
    private games: Repository<GameEntity>;
    private playerProgress: Repository<PlayerProgress>;

    constructor(
        private readonly dataSource: DataSource,
        private readonly questionLimit: number
    ) {
        this.games = this.dataSource.getRepository(GameEntity);
        this.playerProgress = this.dataSource.getRepository(PlayerProgress);
    }

    async findById(id: string): Promise<GameViewDto | null> {
        const game = await this.games
            .createQueryBuilder('g')
            .leftJoinAndSelect(
                (qb) => qb.select(['id', '"questionId"', 'body', '"gameEntityId"']).from(GameQuestion, 'q'),
                'questions',
                'questions."gameEntityId" = g.id'
            )
            .leftJoinAndSelect('g.playerProgress', 'playerProgress')
            .leftJoinAndSelect(
                (qb) =>
                    qb.select(['"questionId"', '"answerStatus"', '"addedAt"', '"playerProgressId"']).from(Answer, 'a'),
                'answers',
                'answers."playerProgressId" = playerProgress.id'
            )
            .select([
                'g.id',
                'g.status',
                'g.pairCreatedDate',
                'g.startGameDate',
                'g.finishGameDate',
                '"playerProgress".*',
                'answers."questionId"',
                'answers."answerStatus"',
                'answers."addedAt"',
                'questions."questionId" as q_id',
                'questions.id as q_sorting_id',
                'questions.body'
            ])
            .where('g.id = :id', { id: id })
            .orderBy('"createdAt"', 'ASC') // needed!! since it is for playerProgress sorting
            .addOrderBy('"addedAt"', 'ASC')
            .addOrderBy('q_sorting_id', 'ASC')
            .getRawMany();

        return game ? (GameViewDto.mapSqlToView(game, this.questionLimit) as GameViewDto) : null; //typecast ибо проверка на нужный вывод есть во вьюшке
    }

    async findActiveForUser(userId: string): Promise<GameViewDto | null> {
        const gameId = await this.games
            .createQueryBuilder('g')
            .leftJoinAndSelect(
                (qb) => qb.select(['"playerId", "gameEntityId"']).from(PlayerProgress, 'pp'),
                'playerProgress',
                '"playerProgress"."gameEntityId" = g.id'
            )
            .select('g.id')
            .where('"playerProgress"."playerId" = :id', { id: userId })
            .andWhere('g.status <> :status', { status: GameStatus.Finished }) //Возвращаем любую(!) не завершенную(!!) игру
            .getRawOne();

        const game = gameId ? await this.findById(gameId.g_id as string) : null;

        return game;
    }

    async findAllForUser(
        userId: string,
        queryParams: GetGamesQueryParams
    ): Promise<PaginatedViewDto<GameViewDto[]> | null> {
        const gameIdsAndAnswersCountQB = this.playerProgress
            .createQueryBuilder('pp')
            .leftJoinAndSelect(
                (qb) => qb.select(['id', '"totalNumberOfAnswers"', 'status']).from(GameEntity, 'g'),
                'games',
                'games.id = pp."gameEntityId"'
            )
            .select('games.*')
            .where('pp."playerId" = :id', { id: userId });

        const gameIdsAndAnswersCount = await gameIdsAndAnswersCountQB.getRawMany();

        const totalCount: number = +(await gameIdsAndAnswersCountQB.getCount());

        const gameQueryData = calculateRows(gameIdsAndAnswersCount, this.questionLimit);

        const queryBuilder = this.games
            .createQueryBuilder('g')
            .leftJoinAndSelect(
                (qb) => qb.select(['id', '"questionId"', 'body', '"gameEntityId"']).from(GameQuestion, 'q'),
                'questions',
                'questions."gameEntityId" = g.id'
            )
            .leftJoinAndSelect('g.playerProgress', 'playerProgress')
            .leftJoinAndSelect(
                (qb) =>
                    qb.select(['"questionId"', '"answerStatus"', '"addedAt"', '"playerProgressId"']).from(Answer, 'a'),
                'answers',
                'answers."playerProgressId" = playerProgress.id'
            )
            .select([
                'g.id',
                'g.status',
                'g.pairCreatedDate',
                'g.startGameDate',
                'g.finishGameDate',
                '"playerProgress".*',
                'answers."questionId"',
                'answers."answerStatus"',
                'answers."addedAt"',
                'questions."questionId" as q_id',
                'questions.id as q_sorting_id',
                'questions.body'
            ])
            .where('g.id = ANY(:id)', { id: [...gameQueryData.ids] });
        if (queryParams.sortBy !== GamesSortBy.status) {
            queryBuilder.orderBy(`g."${queryParams.sortBy}"`, queryParams.sortDirection);
        } else {
            queryBuilder.orderBy(`g."${queryParams.sortBy}"`, queryParams.sortDirection);
            queryBuilder.addOrderBy(`g."pairCreatedDate"`, 'DESC');
        }

        const games = await queryBuilder
            .addOrderBy('"createdAt"', 'ASC')
            .addOrderBy('"addedAt"', 'ASC')
            .addOrderBy('q_sorting_id', 'ASC')
            .offset(queryParams.calculateSkipMyGames(gameQueryData.rowCount))
            .limit(queryParams.calculateTakeMyGames(gameQueryData.rowCount))
            .getRawMany();

        let items = GameViewDto.mapSqlToView(games, this.questionLimit) as GameViewDto[];

        Symbol.iterator in items ? items : (items = [items]); //из-за особенностей вывода мапера - при единственном объекте он его вернет не в массиве

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: queryParams.pageNumber,
            size: queryParams.pageSize
        });
    }

    async getStatisticsData(userId: string): Promise<UserStatisticsViewDto> {
        const { sumScore, avgScores, gamesCount } = await this.playerProgress
            .createQueryBuilder('pp')
            .select([
                'SUM(pp."playerScore") AS "sumScore"',

                'ROUND(AVG(pp."playerScore"), 2) AS "avgScores"',

                'COUNT(pp."gameResult") AS "gamesCount"'
            ])
            .innerJoin('pp.gameEntity', 'games')
            .where('pp."playerId" = :id', { id: userId })
            .andWhere('games."status" = :status', { status: GameStatus.Finished })
            .getRawOne();

        const { winsCount } = await this.playerProgress
            .createQueryBuilder('pp')
            .select('COUNT(pp."gameResult") AS "winsCount"')
            .where('pp."playerId" = :id', { id: userId })
            .andWhere('pp."gameResult" = :status', { status: GameResult.Win })
            .getRawOne();

        const { lossesCount } = await this.playerProgress
            .createQueryBuilder('pp')
            .select('COUNT(pp."gameResult") AS "lossesCount"')
            .where('pp."playerId" = :id', { id: userId })
            .andWhere('pp."gameResult" = :status', { status: GameResult.Loose })
            .getRawOne();

        const drawsCount = (+gamesCount - (+winsCount + +lossesCount)).toString();

        const dto: UserStatisticsSqlDto = { sumScore, avgScores, gamesCount, winsCount, drawsCount, lossesCount };

        return UserStatisticsViewDto.mapSqlToView(dto);
    }

    async getTopUsers(query: GetTopUsersQueryParams): Promise<UserStatisticsViewDto[] | null> {
        /*const playersCount: number = await this.playerProgress
            .createQueryBuilder('gc')
            .distinct()
            .select('pp."playerId"')
            .getCount();*/

        const result = await this.playerProgress
            .createQueryBuilder('pp')
            .select([
                'pp."playerId"',

                'COUNT(pp."playerId") AS "playersCount"',

                'SUM(pp."playerScore") AS "sumScore"',

                'ROUND(AVG(pp."playerScore"), 2) AS "avgScores"',

                'COUNT(pp."gameResult") AS "gamesCount"'
            ])
            .innerJoin('pp.gameEntity', 'games')
            .where('games."status" = :status', { status: GameStatus.Finished })
            .groupBy('pp."playerId"')
            .getRawMany();

        const playersStats = result.map((row) => ({
            playerId: row.playerId,
            playersCount: row.playersCount ?? 0,
            sumScore: row.sumScore ?? 0,
            avgScore: row.avgScore ?? 0,
            gamesCount: row.gamesCount ?? 0
        }));

        console.log(playersStats);

        return null;
    }
}
