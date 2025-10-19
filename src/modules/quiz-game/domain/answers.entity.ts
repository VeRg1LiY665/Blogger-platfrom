import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PlayerProgress } from './playerProgress.entity';
import { AnswerStatus } from './constants/answer-status.constants';
import { CreateAnswerDomainDto } from './dto/create-answer.domain.dto';

@Entity({ name: 'answers' })
export class Answer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    questionId: string;

    @Column({
        type: 'enum',
        enum: AnswerStatus,
        default: AnswerStatus.Incorrect
    })
    answerStatus: AnswerStatus;

    @CreateDateColumn()
    addedAt: Date;

    @ManyToOne(() => PlayerProgress, (playerProgress) => playerProgress.answers)
    @JoinColumn({ name: 'playerProgressId' })
    playerProgress: PlayerProgress;

    @Column()
    playerProgressId: number;

    static createInstance(dto: CreateAnswerDomainDto): Answer {
        const answer = new Answer();

        answer.questionId = dto.questionId;
        answer.answerStatus = dto.answerStatus;

        return answer;
    }
}
