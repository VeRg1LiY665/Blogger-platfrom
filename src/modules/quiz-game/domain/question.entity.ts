import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CreateQuestionDomainDto } from './dto/create-question.domain.dto';
import { UpdateQuestionDomainDto } from './dto/update-question.domain.dto';

@Entity({ name: 'questions' })
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    body: string;

    @Column('text', { array: true, nullable: false })
    correctAnswers: string[];

    @Column('boolean')
    published: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;

    static createInstance(dto: CreateQuestionDomainDto): Question {
        const question = new Question();

        question.body = dto.body;
        question.correctAnswers = dto.correctAnswers;
        question.published = false;

        return question;
    }

    update(dto: UpdateQuestionDomainDto): void {
        this.body = dto.body;
        this.correctAnswers = dto.correctAnswers;
    }

    publish(flag: boolean): void {
        this.published = flag;
    }
}
