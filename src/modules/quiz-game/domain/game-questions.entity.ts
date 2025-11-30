import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CreateQuestionDomainDto } from './dto/create-question.domain.dto';
import { GameEntity } from './game.entity';
import { randomUUID } from 'node:crypto';
import { CreateGameQuestionDomainDto } from './dto/create-game-question.domain.dto';

@Entity({ name: 'game_questions' })
export class GameQuestion {
    @PrimaryColumn('uuid') //TODO Сделать число для мапинга в квери репе + при множественных играх будет 500 из-за первичного ключа
    id: string;

    @Column()
    body: string;

    @Column('text', { array: true, nullable: false })
    correctAnswers: string[];

    @ManyToOne(() => GameEntity, (gameEntity) => gameEntity.questions)
    @JoinColumn({ name: 'gameEntityId' })
    gameEntity: GameEntity;

    @Column()
    gameEntityId: string;

    static createInstance(dto: CreateGameQuestionDomainDto): GameQuestion {
        const question = new GameQuestion();

        question.id = dto.id; // Выкинуть нафиг
        question.body = dto.body;
        question.correctAnswers = dto.correctAnswers;
        question.gameEntityId = dto.gameId;

        return question;
    }
}
