import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { GameEntity } from '../domain/game.entity';
import { GameStatus } from '../domain/constants/game-status.constants';

@Injectable()
export class GamesSqlRepository {
    private games: Repository<GameEntity>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.games = this.dataSource.getRepository(GameEntity);
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
            .select('g.*')
            .where('game.playerProgress.playerId = :playerId', { playerId: userId })
            .andWhere('game.status = :status', { status: GameStatus.Active });

        const game = await queryBuilder.getOne();
        return game;
    }

    async save(game: GameEntity): Promise<string> {
        const res = await this.games.save(game);

        return res.id.toString();
    }
}
