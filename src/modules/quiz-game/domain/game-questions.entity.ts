import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { CreateQuestionDomainDto } from './dto/create-question.domain.dto';
import { GameEntity } from './game.entity';

@Entity({ name: 'game_questions' })
export class GameQuestion {
    @PrimaryColumn()
    id: string;

    @Column()
    body: string;

    @Column('text', { array: true, nullable: false })
    correctAnswers: string[];

    @ManyToOne(() => GameEntity, (gameEntity) => gameEntity.questions)
    gameEntity: GameEntity;

    static createInstance(dto: CreateQuestionDomainDto): GameQuestion {
        const question = new GameQuestion();

        question.body = dto.body;
        question.correctAnswers = dto.correctAnswers;

        return question;
    }
}
