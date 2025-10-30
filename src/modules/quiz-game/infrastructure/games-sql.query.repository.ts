import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { GameEntity } from '../domain/game.entity';
import { GameViewDto } from '../api/view-dto/game.view-dto';
import { PlayerProgress } from '../domain/playerProgress.entity';
import { Answer } from '../domain/answers.entity';
import { GameQuestion } from '../domain/game-questions.entity';
import { GameStatus } from '../domain/constants/game-status.constants';

@Injectable()
export class GamesSqlQueryRepository {
    private games: Repository<GameEntity>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.games = this.dataSource.getRepository(GameEntity);
    }

    async findById(id: string): Promise<GameViewDto | null> {
        const game = await this.games
            .createQueryBuilder('g')
            .leftJoinAndSelect(
                (qb) => qb.select(['id' as '"q_id"', 'body', '"gameEntityId"']).from(GameQuestion, 'q'),
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
                'g."pairCreatedDate"',
                'g."startGameDate"',
                'g."finishGameDate"',
                '"playerProgress".*',
                'answers."questionId"',
                'answers."answerStatus"',
                'answers."addedAt"',
                'questions.id' as '"q_id"',
                'questions.body'
            ])
            .where('g.id = :id', { id: id })
            .getRawMany();

        console.log(game);
        return game ? GameViewDto.mapSqlToView(game) : null;
    }

    /*.leftJoinAndSelect(
                (qb) =>
                    qb
                        .select(['id', '"playerId"', '"playerLogin"', '"playerScore"', '"gameEntityId"'])
                        .from(PlayerProgress, 'p'),
                'playerProgress',
                '"playerProgress"."gameEntityId" = g.id'
            )*/

    async findActiveForUser(userId: string): Promise<GameViewDto | null> {
        const game = await this.games
            .createQueryBuilder('g')
            .leftJoinAndSelect(
                (qb) =>
                    qb
                        .select(['"playerId"', '"playerLogin"', '"playerScore"', '"gameEntityId"'])
                        .from(PlayerProgress, 'p'),
                'playerProgress',
                'playerProgress.gameEntityId = g.id'
            )
            .leftJoinAndSelect(
                (qb) =>
                    qb.select(['"questionId"', '"answerStatus"', '"addedAt"', '"playerProgressId"']).from(Answer, 'a'),
                'answers',
                'answers.playerProgressId = playerProgress.id'
            )
            .leftJoinAndSelect(
                (qb) => qb.select(['"id"', '"body"', '"gameEntityId"']).from(GameQuestion, 'q'),
                'questions',
                'questions.gameEntityId = g.id'
            )
            .select([
                'g.id',
                'g.status',
                'g.pairCreatedDate',
                'g.startGameDate',
                'g.finishGameDate',
                'playerProgress.*',
                'answers.*',
                'questions.*'
            ])
            .where('playerProgress.playerId = :id', { id: userId }) //TODO Check!
            .andWhere('g.status = :status', { status: GameStatus.Active })
            .getRawOne();

        return game ? GameViewDto.mapSqlToView(game) : null;
    }
}
