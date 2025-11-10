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

    @OneToMany(() => PlayerProgress, (playerProgress) => playerProgress.gameEntity, { cascade: false })
    playerProgress: PlayerProgress[];

    @Column({ default: false })
    firstFinished: boolean; //check for first player to finish the game

    @Column({
        type: 'enum',
        enum: GameStatus,
        default: GameStatus.PendingSecondPlayer
    })
    status: GameStatus;

    @OneToMany(() => GameQuestion, (question) => question.gameEntity, { cascade: false })
    questions: GameQuestion[];

    @CreateDateColumn({ name: 'pairCreatedDate' })
    pairCreatedDate: Date;

    @Column({ name: 'startGameDate', nullable: true })
    startGameDate: Date;

    @Column({ name: 'finishGameDate', nullable: true })
    finishGameDate: Date;

    static createInstance(dto: CreateGameDomainDto): GameEntity {
        const game = new this();
        const ppDto = { userId: dto.userId, userLogin: dto.userLogin, gameId: dto.gameId };
        game.id = dto.gameId;
        game.playerProgress = [PlayerProgress.createInstance(ppDto)];
        game.questions = dto.questions;

        return game;
    }

    addPlayer(dto: AddPlayerDomainDto) {
        const ppDto = { userId: dto.userId, userLogin: dto.userLogin, gameId: this.id };
        this.playerProgress.push(PlayerProgress.createInstance(ppDto));
        this.status = GameStatus.Active;
        this.startGameDate = new Date();
    }

    finishGame() {
        this.finishGameDate = new Date();
        this.status = GameStatus.Finished;
    }
}
