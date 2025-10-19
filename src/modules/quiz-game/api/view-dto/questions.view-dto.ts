import { Question } from '../../domain/question.entity';

export class QuestionViewDto {
    id: string;
    body: string;
    correctAnswers: string[];
    published: boolean;
    createdAt: string;
    updatedAt: string;

    static mapSqlToView(question: Question): QuestionViewDto {
        const dto = new QuestionViewDto();

        dto.id = question.id;
        dto.body = question.body;
        dto.correctAnswers = question.correctAnswers;
        dto.published = question.published;
        dto.createdAt = question.createdAt.toISOString();
        dto.updatedAt = question.updatedAt.toISOString();

        return dto;
    }
}
