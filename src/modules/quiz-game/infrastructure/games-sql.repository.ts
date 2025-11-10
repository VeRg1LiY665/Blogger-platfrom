import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { GameEntity } from '../domain/game.entity';
import { GameStatus } from '../domain/constants/game-status.constants';
import { GameQuestion } from '../domain/game-questions.entity';
import { PlayerProgress } from '../domain/playerProgress.entity';

@Injectable()
export class GamesSqlRepository {
    private games: Repository<GameEntity>;
    private gameQuestions: Repository<GameQuestion>;
    private playerProgress: Repository<PlayerProgress>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.games = this.dataSource.getRepository(GameEntity);
        this.gameQuestions = this.dataSource.getRepository(GameQuestion);
        this.playerProgress = this.dataSource.getRepository(PlayerProgress);
    }

    async findById(id: string): Promise<GameEntity | null> {
        const queryBuilder = this.games
            .createQueryBuilder('g')
            .leftJoinAndSelect('g.questions', 'q')
            .leftJoinAndSelect('g.playerProgress', 'pp')
            .leftJoinAndSelect('pp.answers', 'a')
            .where('g.id = :id', { id });
        const game = await queryBuilder.getOne();

        return game;
    }

    async findPendingGame(): Promise<GameEntity | null> {
        const queryBuilder = this.games
            .createQueryBuilder('g')
            .leftJoinAndSelect('g.questions', 'q')
            .leftJoinAndSelect('g.playerProgress', 'pp')
            .leftJoinAndSelect('pp.answers', 'a')
            .where('g.status = :status', { status: GameStatus.PendingSecondPlayer });

        const game = await queryBuilder.getOne();

        return game;
    }

    async findActiveByPlayer(userId: string): Promise<GameEntity | null> {
        const gameId = await this.games
            .createQueryBuilder('g')
            .leftJoinAndSelect(
                (qb) => qb.select(['"playerId", "gameEntityId"']).from(PlayerProgress, 'pp'),
                'playerProgress',
                '"playerProgress"."gameEntityId" = g.id'
            )
            .select('g.id')
            .where('"playerProgress"."playerId" = :id', { id: userId })
            .andWhere('g.status = :status', { status: GameStatus.Active })
            .getRawOne();

        return gameId ? await this.findById(gameId.g_id as string) : null;

        /* const queryBuilder = this.games
            .createQueryBuilder('g')
            .leftJoinAndSelect('g.questions', 'q')
            .leftJoinAndSelect('g.playerProgress', 'pp')
            .leftJoinAndSelect('pp.answers', 'a')
            .where('pp.playerId = :playerId', { playerId: userId })
            .andWhere('g.status = :status', { status: GameStatus.Active });

        const game = await queryBuilder.getOne();
        return game;*/
    }

    async save(game: GameEntity): Promise<string> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const res = await this.games.save(game);
            await this.gameQuestions.save(game.questions);
            await this.playerProgress.save(game.playerProgress);

            await queryRunner.commitTransaction();
            return res.id.toString();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new Error(err);
        } finally {
            // you need to release query runner which is manually created:
            await queryRunner.release();
        }
    }
}
