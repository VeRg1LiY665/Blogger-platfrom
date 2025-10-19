import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Question } from '../domain/question.entity';

@Injectable()
export class QuestionsSqlRepository {
    private questions: Repository<Question>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.questions = this.dataSource.getRepository(Question);
    }

    async findById(id: string): Promise<Question | null> {
        const question = await this.questions.findOne({ where: { id: id } });
        return question;
    }

    async findForGame(quantity: number): Promise<Question[]> {
        const queryBuilder = this.questions
            .createQueryBuilder('q')
            .where('q.published = :flag', { flag: true })
            .orderBy('RANDOM()')
            .take(quantity);

        const questions = await queryBuilder.getMany();
        return questions;
    }

    async save(question: Question): Promise<string> {
        const res = await this.questions.save(question);

        return res.id.toString();
    }

    async delete(id: string): Promise<void> {
        await this.questions.delete({ id: id });
    }
}
