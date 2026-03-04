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

        //TODO СПРОСИТЬ норм ли делать через два запроса

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
            .where('g.id = ANY(:id)', { id: [...gameQueryData.ids] })
            .orderBy(`g."${queryParams.sortBy}"`, queryParams.sortDirection)
            .addOrderBy('"createdAt"', 'ASC')
            .addOrderBy('"addedAt"', 'ASC')
            .addOrderBy('q_sorting_id', 'ASC');
        //.getRawMany();

        const games = await queryBuilder
            .take(queryParams.calculateTakeMyGames(gameQueryData.rowCount))
            .skip(queryParams.calculateSkipMyGames(gameQueryData.rowCount))
            .getRawMany();

        //console.log(games);
        const items = GameViewDto.mapSqlToView(games, this.questionLimit) as GameViewDto[];

        console.log(items);
        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: queryParams.pageNumber,
            size: queryParams.pageSize
        });
    }
}
