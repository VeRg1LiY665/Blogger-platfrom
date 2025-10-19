import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlayerProgress } from './playerProgress.entity';
import { GameStatus } from './constants/game-status.constants';
import { CreateGameDomainDto } from './dto/create-game.domain.dto';
import { AddPlayerDomainDto } from './dto/add-player.domain.dto';
import { GameQuestion } from './game-questions.entity';

@Entity({ name: 'games' })
export class GameEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => PlayerProgress, (playerProgress) => playerProgress.gameEntity, { cascade: true })
    playerProgress: PlayerProgress[];

    @Column({ default: false })
    firstFinished: boolean; //check for first player to finish the game

    @Column({
        type: 'enum',
        enum: GameStatus,
        default: GameStatus.PendingSecondPlayer
    })
    status: GameStatus;

    @OneToMany(() => GameQuestion, (question) => question.gameEntity, { cascade: true })
    questions: GameQuestion[];

    @CreateDateColumn({ name: 'pairCreatedDate' })
    pairCreatedDate: Date;

    @Column({ name: 'startGameDate', nullable: true })
    startGameDate: Date;

    @Column({ name: 'finishGameDate', nullable: true })
    finishGameDate: Date;

    static createInstance(dto: CreateGameDomainDto): GameEntity {
        const game = new this();

        game.playerProgress = [new PlayerProgress(dto.userId, dto.userLogin)];
        game.questions = dto.questions;

        return game;
    }

    addPlayer(dto: AddPlayerDomainDto) {
        this.playerProgress.push(new PlayerProgress(dto.userId, dto.userLogin));
        this.status = GameStatus.Active;
    }
}
