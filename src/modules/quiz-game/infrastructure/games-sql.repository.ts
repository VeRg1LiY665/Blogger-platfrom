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
    private queryRunner: QueryRunner;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.games = this.dataSource.getRepository(GameEntity);
        this.gameQuestions = this.dataSource.getRepository(GameQuestion);
        this.playerProgress = this.dataSource.getRepository(PlayerProgress);
        this.queryRunner = this.dataSource.createQueryRunner();
    }

    async findById(id: string): Promise<GameEntity | null> {
        return await this.games.findOne({ where: { id: id } });
    }

    async findPendingGame(): Promise<GameEntity | null> {
        return await this.games.findOne({ where: { status: GameStatus.PendingSecondPlayer } });
    }

    async findActiveByPlayer(userId: string): Promise<GameEntity | null> {
        const queryBuilder = this.games
            .createQueryBuilder('g')
            .leftJoinAndSelect('g.playerProgress', 'pp')
            .select('g.*')
            .where('pp.playerId = :playerId', { playerId: userId })
            .andWhere('g.status = :status', { status: GameStatus.Active });

        const game = await queryBuilder.getOne();
        return game;
    }

    async save(game: GameEntity): Promise<string> {
        await this.queryRunner.connect();
        await this.queryRunner.startTransaction();
        try {
            const res = await this.games.save(game);
            await this.gameQuestions.save(game.questions);
            await this.playerProgress.save(game.playerProgress);

            return res.id.toString();
        } catch (err) {
            await this.queryRunner.rollbackTransaction();
            throw new Error(err);
        } finally {
            // you need to release query runner which is manually created:
            await this.queryRunner.release();
        }
    }
}
