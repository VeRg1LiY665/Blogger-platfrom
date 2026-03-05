import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlayerProgress } from './playerProgress.entity';
import { GameStatus } from './constants/game-status.constants';
import { CreateGameDomainDto } from './dto/create-game.domain.dto';
import { AddPlayerDomainDto } from './dto/add-player.domain.dto';
import { GameQuestion } from './game-questions.entity';
import { GameResult } from './constants/game-result.constants';

@Entity({ name: 'games' })
export class GameEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => PlayerProgress, (playerProgress) => playerProgress.gameEntity, { cascade: true })
    playerProgress: PlayerProgress[];

    @Column({ default: 255 })
    firstFinished: number; //check for first player to finish the game - index of playerProgress

    @Column({
        type: 'enum',
        enum: GameStatus,
        default: GameStatus.PendingSecondPlayer
    })
    status: GameStatus;

    @OneToMany(() => GameQuestion, (question) => question.gameEntity, { cascade: true, nullable: false })
    questions: GameQuestion[];

    @CreateDateColumn({ name: 'pairCreatedDate' })
    pairCreatedDate: Date;

    @Column({ name: 'startGameDate', nullable: true })
    startGameDate: Date;

    @Column({ name: 'finishGameDate', nullable: true })
    finishGameDate: Date;

    @Column({ default: 0 })
    totalNumberOfAnswers: number;

    static createInstance(dto: CreateGameDomainDto): GameEntity {
        const game = new this();
        const ppDto = { userId: dto.userId, userLogin: dto.userLogin, gameId: game.id };

        game.playerProgress = [PlayerProgress.createInstance(ppDto)];
        game.questions = [];

        return game;
    }

    addPlayer(dto: AddPlayerDomainDto) {
        this.questions = dto.questions;
        const ppDto = { userId: dto.userId, userLogin: dto.userLogin, gameId: this.id };
        this.playerProgress.push(PlayerProgress.createInstance(ppDto));
        this.status = GameStatus.Active;
        this.startGameDate = new Date();
    }

    finishGame(index: number) {
        if (this.playerProgress[index].playerScore > 0) {
            this.playerProgress[index].playerScore++;
        }
        this.finishGameDate = new Date();
        this.status = GameStatus.Finished;

        switch (this.playerProgress[0].playerScore > this.playerProgress[1].playerScore) {
            case true:
                this.playerProgress[0].gameResult = GameResult.Win;
                this.playerProgress[1].gameResult = GameResult.Loose;
                break;
            case false:
                this.playerProgress[1].gameResult = GameResult.Win;
                this.playerProgress[0].gameResult = GameResult.Loose;
                break;
        }
    }

    countTotalNumberOfAnswers() {
        this.totalNumberOfAnswers++;
    }
}
